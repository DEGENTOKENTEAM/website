import { ManageStakeXContext } from '@dapphelpers/defitools'
import { toReadableNumber } from '@dapphelpers/number'
import { useGetERC20BalanceOf } from '@dapphooks/shared/useGetERC20BalanceOf'
import { useGetRewardTokens } from '@dapphooks/staking/useGetRewardTokens'
import { useHasDepositRestriction } from '@dapphooks/staking/useHasDepositRestriction'
import { useInjectRewards } from '@dapphooks/staking/useInjectRewards'
import { Tile } from '@dappshared/Tile'
import { TokenInfoResponse } from '@dapptypes'
import { Description, Field, Input, Label, Select } from '@headlessui/react'
import clsx from 'clsx'
import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from 'src/components/Button'
import { Spinner } from 'src/components/dapp/elements/Spinner'
import { formatUnits, getAddress, parseUnits } from 'viem'
import { useAccount } from 'wagmi'

export const InjectRewards = () => {
    const {
        data: { chain, protocol },
    } = useContext(ManageStakeXContext)

    const { address, chainId } = useAccount()

    const rewardSelectionRef = useRef<HTMLElement>(null)
    const rewardAmountRef = useRef<HTMLElement>(null)

    const [isRestricted, setIsRestricted] = useState(false)
    const [selectedRewardToken, setSelectedRewardToken] =
        useState<TokenInfoResponse>()
    const [rewardAmountEntered, setRewardAmountEntered] = useState<string>('')
    const [rewardAmount, setRewardAmount] = useState<bigint>(0n)
    const [errorMessage, setErrorMessage] = useState('')
    const [hasError, setHasError] = useState(false)

    const { data: dataHasDepositRestriction } = useHasDepositRestriction(
        chain?.id!,
        protocol
    )
    const { data: dataGetRewardTokens } = useGetRewardTokens(
        protocol,
        chain?.id!
    )
    const {
        data: dataBalanceOf,
        isLoading: isLoadingBalanceOf,
        refetch: refetchBalanceOf,
    } = useGetERC20BalanceOf(selectedRewardToken?.source!, address!, chainId)

    const {
        error: errorInjectRewards,
        isLoading: isLoadingInjectRewards,
        isPending: isPendingInjectRewards,
        isSuccess: isSuccessInjectRewards,
        isError: isErrorInjectRewards,
        write: writeInjectRewards,
        reset: resetInjectRewards,
    } = useInjectRewards(
        protocol,
        chain?.id!,
        selectedRewardToken?.source!,
        rewardAmount
    )

    //
    // Errors
    //
    const setError = (message: string) => {
        setHasError(true)
        setErrorMessage(message)
    }

    const resetError = () => {
        setHasError(false)
        setErrorMessage('')
    }

    const onChangeRewardToken = () => {
        setSelectedRewardToken(
            dataGetRewardTokens?.find(
                (token) =>
                    token.source ===
                    getAddress(
                        (rewardSelectionRef.current as HTMLSelectElement).value
                    )
            )
        )

        setRewardAmount(0n)
        setRewardAmountEntered('')
    }

    const onChangeRewardAmount = (_event: ChangeEvent<HTMLInputElement>) => {
        _event.preventDefault()
        setRewardAmountEntered(_event.target.value)
    }

    const onClickInject = () => {
        resetInjectRewards()
        writeInjectRewards && writeInjectRewards()
    }

    useEffect(() => {
        typeof dataHasDepositRestriction === 'boolean' &&
            setIsRestricted(dataHasDepositRestriction)
    }, [dataHasDepositRestriction])

    useEffect(() => {
        dataGetRewardTokens &&
            !selectedRewardToken &&
            setSelectedRewardToken(dataGetRewardTokens.at(0))
    }, [dataGetRewardTokens, selectedRewardToken])

    useEffect(() => {
        if (
            Boolean(dataBalanceOf && rewardAmountEntered && selectedRewardToken)
        ) {
            const rewardAmountEnteredBN = parseUnits(
                rewardAmountEntered,
                Number(selectedRewardToken?.decimals)
            )
            const checkRewardAmountEntered = formatUnits(
                rewardAmountEnteredBN,
                Number(selectedRewardToken?.decimals)
            )

            if (rewardAmountEntered != checkRewardAmountEntered) {
                setRewardAmount(0n)
                setError(
                    `Invalid decimals (${selectedRewardToken?.decimals} allowed)`
                )
                return
            }

            if (dataBalanceOf! - rewardAmountEnteredBN < 0n) {
                setRewardAmount(0n)
                setError(`Insufficient ${selectedRewardToken?.symbol} balance`)
                return
            } else {
                setRewardAmount(rewardAmountEnteredBN)
                resetError()
            }
        }

        if (!rewardAmountEntered) {
            setRewardAmount(0n)
            resetError()
        }
    }, [dataBalanceOf, rewardAmountEntered, selectedRewardToken])

    useEffect(() => {
        if (
            !isLoadingInjectRewards &&
            isSuccessInjectRewards &&
            selectedRewardToken
        ) {
            toast.success(
                `Successfully injected ${formatUnits(
                    rewardAmount,
                    Number(selectedRewardToken.decimals)
                )} ${selectedRewardToken.symbol}`
            )
            refetchBalanceOf && refetchBalanceOf()
        }

        !isLoadingInjectRewards &&
            isErrorInjectRewards &&
            errorInjectRewards &&
            toast.error((errorInjectRewards as any).shortMessage)
    }, [
        isSuccessInjectRewards,
        isErrorInjectRewards,
        errorInjectRewards,
        isLoadingInjectRewards,
        selectedRewardToken,
        refetchBalanceOf,
    ])

    return (
        <Tile className="flex w-full flex-col gap-8">
            <div className="flex flex-row items-center">
                <span className="flex-1 font-title text-xl font-bold">
                    Inject Rewards
                </span>
            </div>
            {dataGetRewardTokens && (
                <div className="flex flex-col gap-8">
                    <Field>
                        <Label className="text-base/6 font-normal text-dapp-cyan-50">
                            Reward Token
                        </Label>
                        <Description className="text-sm/6 text-dapp-cyan-50/50">
                            Select a reward token that you want to inject.
                        </Description>
                        <Select
                            disabled={isRestricted}
                            className={clsx(
                                'mt-2 block w-full appearance-none rounded-lg border-0 bg-dapp-blue-800 text-left text-2xl leading-10 focus:ring-0 focus:ring-offset-0',
                                'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25',
                                '*:text-black'
                            )}
                            ref={rewardSelectionRef}
                            onChange={onChangeRewardToken}
                        >
                            {dataGetRewardTokens.map((token) => (
                                <option key={token.source} value={token.source}>
                                    {token.name} ({token.symbol})
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field>
                        <Label className="text-base/6 font-normal text-dapp-cyan-50">
                            Amount
                        </Label>
                        <Description className="text-sm/6 text-dapp-cyan-50/50">
                            Enter the amount you want to inject (No WEI amount)
                        </Description>
                        <Input
                            disabled={isRestricted}
                            type="number"
                            placeholder="0"
                            value={rewardAmountEntered}
                            onChange={onChangeRewardAmount}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="mt-2 w-full rounded-lg border-0 bg-dapp-blue-800 text-left text-2xl leading-10 [appearance:textfield] focus:ring-0 focus:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            ref={rewardAmountRef}
                        />
                        <span className="mt-2 flex items-center gap-2 text-xs/8 text-dapp-cyan-50/50">
                            Available:{' '}
                            {isLoadingBalanceOf ? (
                                <Spinner theme="dark" className="h-4 w-4" />
                            ) : (
                                `${toReadableNumber(
                                    dataBalanceOf,
                                    selectedRewardToken?.decimals
                                )} ${selectedRewardToken?.symbol}`
                            )}
                        </span>
                    </Field>
                </div>
            )}
            <div>
                <Button
                    className="w-full"
                    variant={hasError || isRestricted ? 'error' : 'primary'}
                    onClick={onClickInject}
                    disabled={hasError || isRestricted || rewardAmount === 0n}
                >
                    {!isPendingInjectRewards && !isLoadingInjectRewards ? (
                        hasError ? (
                            errorMessage
                        ) : isRestricted ? (
                            'Not allowed'
                        ) : (
                            'Inject now'
                        )
                    ) : (
                        <Spinner theme="dark" className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </Tile>
    )
}
