import { ManageStakeXContext } from '@dapphelpers/defitools'
import { toReadableNumber } from '@dapphelpers/number'
import { useERC20Approve } from '@dapphooks/shared/useERC20Approve'
import { useGetERC20BalanceOf } from '@dapphooks/shared/useGetERC20BalanceOf'
import { useHasERC20Allowance } from '@dapphooks/shared/useHasERC20Allowance'
import { useGetRewardTokens } from '@dapphooks/staking/useGetRewardTokens'
import { useGetStakingData } from '@dapphooks/staking/useGetStakingData'
import { useHasDepositRestriction } from '@dapphooks/staking/useHasDepositRestriction'
import { useInjectRewards } from '@dapphooks/staking/useInjectRewards'
import { Tile } from '@dappshared/Tile'
import { TokenInfoResponse } from '@dapptypes'
import { Description, Field, Input, Label, Select } from '@headlessui/react'
import clsx from 'clsx'
import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react'
import { MdLockOutline } from 'react-icons/md'
import { toast } from 'react-toastify'
import { Button } from 'src/components/Button'
import { Spinner } from 'src/components/dapp/elements/Spinner'
import { formatUnits, getAddress, parseUnits } from 'viem'
import { useAccount } from 'wagmi'

export const InjectRewards = () => {
    const {
        data: { chain, protocol },
    } = useContext(ManageStakeXContext)

    const { address } = useAccount()

    const rewardSelectionRef = useRef<HTMLElement>(null)
    const rewardAmountRef = useRef<HTMLElement>(null)

    const [isRestricted, setIsRestricted] = useState(false)
    const [selectedRewardToken, setSelectedRewardToken] = useState<TokenInfoResponse>()
    const [rewardAmountEntered, setRewardAmountEntered] = useState<string>('')
    const [rewardAmount, setRewardAmount] = useState<bigint>(0n)
    const [errorMessage, setErrorMessage] = useState('')
    const [hasError, setHasError] = useState(false)
    const [allowance, setAllowance] = useState(0n)
    const [hasAllowance, setHasAllowance] = useState(false)

    const { data: dataStaking } = useGetStakingData(protocol, chain?.id!)
    const { data: dataHasAllowance, refetch: refetchHasAllowance } = useHasERC20Allowance(
        selectedRewardToken?.source!,
        address!,
        protocol,
        chain?.id!
    )
    const {
        isPending: isPendingApproval,
        isSuccess: isSuccessApproval,
        write: writeApproval,
    } = useERC20Approve(selectedRewardToken?.source!, protocol, rewardAmount, chain?.id!)
    const { data: dataHasDepositRestriction } = useHasDepositRestriction(chain?.id!, protocol)
    const { data: dataGetRewardTokens } = useGetRewardTokens(protocol, chain?.id!)
    const {
        data: dataBalanceOf,
        isLoading: isLoadingBalanceOf,
        refetch: refetchBalanceOf,
    } = useGetERC20BalanceOf(selectedRewardToken?.source!, address!, chain?.id!)
    const {
        error: errorInjectRewards,
        isLoading: isLoadingInjectRewards,
        isPending: isPendingInjectRewards,
        isSuccess: isSuccessInjectRewards,
        isError: isErrorInjectRewards,
        write: writeInjectRewards,
        reset: resetInjectRewards,
    } = useInjectRewards(protocol, chain?.id!, selectedRewardToken?.source!, rewardAmount, hasAllowance)

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
                (token) => token.source === getAddress((rewardSelectionRef.current as HTMLSelectElement).value)
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
        if (hasAllowance) writeInjectRewards && writeInjectRewards()
        else writeApproval && writeApproval()
    }

    useEffect(() => {
        if (!isPendingApproval && isSuccessApproval) {
            if (allowance >= rewardAmount) writeInjectRewards && writeInjectRewards()
            else refetchHasAllowance && refetchHasAllowance()
        }
    }, [isPendingApproval, isSuccessApproval, allowance, rewardAmount, writeInjectRewards, refetchHasAllowance])

    useEffect(() => {
        typeof dataHasDepositRestriction === 'boolean' && setIsRestricted(dataHasDepositRestriction)
    }, [dataHasDepositRestriction])

    useEffect(() => {
        dataGetRewardTokens && !selectedRewardToken && setSelectedRewardToken(dataGetRewardTokens.at(0))
    }, [dataGetRewardTokens, selectedRewardToken])

    useEffect(() => {
        if (Boolean(dataBalanceOf && rewardAmountEntered && selectedRewardToken)) {
            const rewardAmountEnteredBN = parseUnits(rewardAmountEntered, Number(selectedRewardToken?.decimals))
            const checkRewardAmountEntered = formatUnits(rewardAmountEnteredBN, Number(selectedRewardToken?.decimals))

            if (rewardAmountEntered != checkRewardAmountEntered) {
                setRewardAmount(0n)
                setError(`Invalid decimals (${selectedRewardToken?.decimals} allowed)`)
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
        if (!isLoadingInjectRewards && isSuccessInjectRewards && selectedRewardToken && rewardAmount) {
            toast.success(
                `Successfully injected ${formatUnits(rewardAmount, Number(selectedRewardToken.decimals))} ${
                    selectedRewardToken.symbol
                }`
            )
            refetchBalanceOf && refetchBalanceOf()
        }

        !isLoadingInjectRewards &&
            isErrorInjectRewards &&
            errorInjectRewards &&
            toast.error((errorInjectRewards as any).shortMessage)
    }, [
        rewardAmount,
        isSuccessInjectRewards,
        isErrorInjectRewards,
        errorInjectRewards,
        isLoadingInjectRewards,
        selectedRewardToken,
        refetchBalanceOf,
    ])

    useEffect(() => {
        if (dataHasAllowance) {
            setAllowance(dataHasAllowance)
            setHasAllowance(Boolean(rewardAmount && rewardAmount > 0n && dataHasAllowance >= rewardAmount))
        }
    }, [dataHasAllowance, rewardAmount])

    return (
        <Tile className="relative flex w-full flex-col gap-8">
            <div className="flex flex-row items-center">
                <span className="flex-1 font-title text-xl font-bold">Inject Rewards</span>
            </div>
            {dataGetRewardTokens && (
                <>
                    <div className="flex flex-col gap-8">
                        <Field>
                            <Label className="text-base/6 font-normal text-dapp-cyan-50">Reward Token</Label>
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
                            <Label className="text-base/6 font-normal text-dapp-cyan-50">Amount</Label>
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
                                    `${toReadableNumber(dataBalanceOf, selectedRewardToken?.decimals)} ${
                                        selectedRewardToken?.symbol
                                    }`
                                )}
                            </span>
                        </Field>
                    </div>
                    <div>
                        <Button
                            className="w-full"
                            variant={hasError || isRestricted ? 'error' : 'primary'}
                            onClick={onClickInject}
                            disabled={hasError || isRestricted || rewardAmount === 0n}
                        >
                            {!isPendingInjectRewards && !isLoadingInjectRewards && !isPendingApproval ? (
                                hasError ? (
                                    errorMessage
                                ) : isRestricted ? (
                                    'Not allowed'
                                ) : (
                                    'Inject now'
                                )
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Spinner theme="dark" className="h-4 w-4" />{' '}
                                    {isPendingApproval ? 'Approving amount...' : 'Injecting amount...'}
                                </div>
                            )}
                        </Button>
                    </div>
                </>
            )}
            {dataStaking && dataStaking.stakes === 0n && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 border-b border-t border-dapp-blue-100 bg-dapp-blue-800/90 md:rounded-lg md:border">
                    <MdLockOutline className="h-32 w-32" />
                    <span className="text-center">
                        The protocol does not have any {dataStaking.staked.tokenInfo.symbol} staked yet. <br />
                        You can only inject rewards when there is at least one stake available.
                    </span>
                </div>
            )}
        </Tile>
    )
}
