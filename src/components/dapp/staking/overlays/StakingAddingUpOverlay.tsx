import { toReadableNumber } from '@dapphelpers/number'
import { durationFromSeconds, StakeXContext } from '@dapphelpers/staking'
import { useERC20Approve } from '@dapphooks/shared/useERC20Approve'
import { useGetERC20BalanceOf } from '@dapphooks/shared/useGetERC20BalanceOf'
import { useHasERC20Allowance } from '@dapphooks/shared/useHasERC20Allowance'
import { useAddUp } from '@dapphooks/staking/useAddUp'
import { useGetAddingUpEstimation } from '@dapphooks/staking/useGetAddingUpEstimation'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { BaseOverlay, BaseOverlayProps } from '@dappshared/overlays/BaseOverlay'
import { StakeResponse, TokenInfo, TokenInfoResponse } from '@dapptypes'
import { Checkbox, Description, Field, Input, Label } from '@headlessui/react'
import { Tooltip } from 'flowbite-react'
import { isUndefined, pick } from 'lodash'
import { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { FaArrowLeft } from 'react-icons/fa6'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { MdError } from 'react-icons/md'
import { SpinnerCircular } from 'spinners-react'
import { Address, formatUnits, parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import { Button } from '../../../Button'
import { Spinner } from '../../elements/Spinner'
import { StakingPayoutTokenSelection } from '../StakingPayoutTokenSelection'

type StakingAddingUpOverlayProps = {
    protocolAddress: Address
    chainId: number
    tokens: TokenInfoResponse[]
    stakingTokenInfo: TokenInfoResponse
    payoutTokenInfo: TokenInfo
    stake: StakeResponse
} & BaseOverlayProps

export const StakingAddingUpOverlay = ({
    isOpen,
    onClose,
    protocolAddress,
    chainId,
    tokens,
    stakingTokenInfo,
    payoutTokenInfo,
    stake,
}: StakingAddingUpOverlayProps) => {
    const { address } = useAccount()
    const [isLoading, setIsLoading] = useState(true)
    const {
        data: { actionFeeActive, actionFeeThreshold },
    } = useContext(StakeXContext)

    //
    // Deposit State
    //
    const amountRef = useRef<HTMLInputElement>(null)
    const [amountEntered, setAmountEntered] = useState<string>('')
    const [amount, setAmount] = useState<bigint>(0n)
    const [hasAllowance, setHasAllowance] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [isCheckboxSelected, setIsCheckboxSelected] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>()

    //
    // Payout State
    //
    const [payoutToken, setPayoutToken] = useState<TokenInfo>(payoutTokenInfo)
    const [claimRewards, setClaimRewards] = useState(true)
    const [targetTokens, setTargetTokens] = useState<TokenInfoResponse[]>([])

    //
    // Deposit Hooks
    //
    const {
        data: dataBalanceOf,
        isLoading: isLoadingBalanceOf,
        refetch: refetchBalanceOf,
    } = useGetERC20BalanceOf(stakingTokenInfo.source, address!, chainId)
    const {
        data: dataAllowance,
        isLoading: isLoadingAllowance,
        refetch: refetchAllowance,
    } = useHasERC20Allowance(stakingTokenInfo.source, address!, protocolAddress, chainId, false)
    const {
        write: writeApprove,
        isLoading: isLoadingApprove,
        isSuccess: isSuccessApprove,
        error: errorApprove,
        isError: isErrorApprove,
        reset: resetApprove,
        hash: hashApprove,
    } = useERC20Approve(stakingTokenInfo.source, protocolAddress, amount!, chainId)

    //
    // Add Up Hooks
    //
    const { data: dataAddingUpEstimation, isLoading: isLoadingAddingUpEstimation } = useGetAddingUpEstimation(
        protocolAddress,
        chainId,
        stake.tokenId,
        amount,
        !claimRewards,
        payoutToken?.source
    )
    const {
        write: writeAddUp,
        reset: resetAddUp,
        isLoading: isLoadingAddUp,
        isSuccess: isSuccessAddUp,
        stakedAmount,
        claimedAmount,
        isError: isErrorAddUp,
        error: errorAddUp,
        hash: hashAddUp,
    } = useAddUp(
        isReady && hasAllowance,
        protocolAddress,
        chainId,
        stake.tokenId,
        amount,
        !claimRewards,
        payoutToken?.source,
        actionFeeActive,
        actionFeeThreshold
    )

    //
    // Deposit Handlers
    //
    const onChangeRewardAmount = (_event: ChangeEvent<HTMLInputElement>) => {
        _event.preventDefault()
        setAmountEntered(_event.target.value) // TODO maybe insert some debounce
    }

    const onCloseHandler = () => {
        resetApprove && resetApprove()
        resetAddUp && resetAddUp()
        onClose && onClose()
    }

    const onClickPayoutHandler = (target: TokenInfoResponse) => {
        if (payoutToken?.source != target.source) {
            setPayoutToken(pick(target, ['name', 'symbol', 'decimals', 'source']) as TokenInfo)
        }
    }

    const onClickButtonHandler = useCallback(() => {
        if (!hasAllowance) writeApprove && writeApprove()
        else writeAddUp && writeAddUp()
    }, [writeAddUp, writeApprove, hasAllowance])

    const onClickCancelButtonHandler = () => {
        onCloseHandler()
    }

    const onClickCloseButtonHandler = () => {
        onCloseHandler()
    }

    const onClickTryAgainButtonHandler = useCallback(() => {
        resetAddUp && resetAddUp()
        resetApprove && resetApprove()
    }, [resetAddUp, resetApprove])

    //
    // deposit error handling
    //
    const setError = (message: string) => {
        setHasError(true)
        setErrorMessage(message)
    }

    const resetError = () => {
        setHasError(false)
        setErrorMessage('')
    }

    useEffect(() => {
        if (tokens && tokens.length > 0) {
            setTargetTokens(tokens.filter((token) => token.isTarget))
        } else setTargetTokens([])
    }, [tokens])

    useEffect(() => {
        if (isLoading) setIsLoading(!tokens || isLoadingAddingUpEstimation)
    }, [isLoading, isLoadingAddingUpEstimation, tokens])

    //
    // Deposit Effects
    //
    useEffect(() => {
        if (Boolean(dataBalanceOf && amountEntered)) {
            const amountEnteredBN = parseUnits(amountEntered, Number(stakingTokenInfo.decimals))
            const checkAmountEntered = formatUnits(amountEnteredBN, Number(stakingTokenInfo.decimals))

            if (amountEntered != checkAmountEntered) {
                setAmount(0n)
                setError(`Invalid decimals (${stakingTokenInfo.decimals} allowed)`)
                return
            }

            if (dataBalanceOf! - amountEnteredBN < 0n) {
                setAmount(0n)
                setError(`Insufficient ${stakingTokenInfo?.symbol} balance`)
                return
            } else {
                setAmount(amountEnteredBN)
                resetError()
            }
        }

        if (!amountEntered) {
            setAmount(0n)
            resetError()
        }

        setIsCheckboxSelected(false)
    }, [dataBalanceOf, amountEntered, stakingTokenInfo.decimals, stakingTokenInfo.symbol])

    useEffect(() => {
        setIsReady(
            Boolean(
                isCheckboxSelected &&
                    !isUndefined(amount) &&
                    amount > 0n &&
                    (claimRewards ? Boolean(payoutToken) : true)
            )
        )
    }, [amount, payoutToken, isCheckboxSelected, claimRewards])

    useEffect(() => {
        setHasAllowance(
            !isUndefined(amount) &&
                amount > 0n &&
                !isUndefined(dataAllowance) &&
                dataAllowance > 0n &&
                amount <= dataAllowance
        )
    }, [amount, dataAllowance])

    useEffect(() => {
        setIsReady(
            Boolean(
                isCheckboxSelected &&
                    !isUndefined(amount) &&
                    amount > 0n &&
                    (claimRewards ? Boolean(payoutToken) : true)
            )
        )
    }, [amount, payoutToken, isCheckboxSelected, claimRewards])

    //
    // processing deposit
    //

    // if an approval is successful, a hash is existing, then an allowance check will be performed
    useEffect(() => {
        if (isSuccessApprove && hashApprove && refetchAllowance) refetchAllowance()
    }, [isSuccessApprove, hashApprove, refetchAllowance])

    // trigger add up if allowance was checked and triggered by an approval
    useEffect(() => {
        if (isSuccessApprove && hashApprove && hasAllowance && writeAddUp) {
            writeAddUp()
        }
    }, [isSuccessApprove, hashApprove, writeAddUp, hasAllowance])

    return (
        <BaseOverlay isOpen={isOpen} closeOnBackdropClick={false} onClose={onCloseHandler}>
            {isLoading && (
                <div className="flex flex-row items-center justify-center">
                    <Spinner theme="dark" className="m-20 !h-24 !w-24" />
                </div>
            )}

            {!isLoading &&
                !isLoadingAddUp &&
                !isSuccessAddUp &&
                !isErrorAddUp &&
                !isLoadingApprove &&
                !isSuccessApprove &&
                !isErrorApprove && (
                    <>
                        <div className="flex flex-col gap-6 text-base">
                            <h3 className="flex flex-row items-center gap-3 text-xl">
                                <div className="font-title">Add more {stakingTokenInfo.symbol}</div>
                                <div>
                                    <Tooltip
                                        content={
                                            <span>
                                                This option will add more {stakingTokenInfo.symbol} to your selected
                                                stake.
                                                <br />
                                                <br />
                                                If you add more {stakingTokenInfo.symbol} to your stake into a locked
                                                pool, it will renew your lock period based on the lock period of the
                                                current stake.
                                                <br />
                                                <br />
                                                If you add more {stakingTokenInfo.symbol} to your stake into a burned
                                                pool, it will burn the new amount.
                                            </span>
                                        }
                                        className="bg-dapp-blue-50"
                                        placement="auto"
                                    >
                                        <AiOutlineQuestionCircle data-tooltip-target="tooltip-default" />
                                    </Tooltip>
                                </div>
                                <div className="flex grow justify-end">
                                    <button
                                        type="button"
                                        className="flex items-center justify-end gap-1 text-xs"
                                        onClick={onCloseHandler}
                                    >
                                        <FaArrowLeft className="size-3" />
                                        Back
                                    </button>
                                </div>
                            </h3>

                            <Field className="flex flex-col gap-0">
                                <Label className="text-base/6 font-normal text-dapp-cyan-50">Staking Amount</Label>
                                <Description className="text-sm/6 text-dapp-cyan-50/50">
                                    Enter {stakingTokenInfo.symbol} amount to add to selected stake
                                </Description>
                                <Input
                                    disabled={isUndefined(dataBalanceOf) || dataBalanceOf === 0n}
                                    type="number"
                                    placeholder="0"
                                    autoComplete="off"
                                    value={amountEntered}
                                    onChange={onChangeRewardAmount}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    className="w-full rounded-lg border-0 bg-dapp-blue-800 text-left text-2xl leading-10 [appearance:textfield] focus:ring-0 focus:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    ref={amountRef}
                                />
                                {hasError && <span className="text-xs/8 text-error">{errorMessage}</span>}
                                <span className="flex items-center gap-2 text-xs/8 text-dapp-cyan-50/50">
                                    Available:{' '}
                                    {isLoadingBalanceOf ? (
                                        <Spinner theme="dark" className="size-4" />
                                    ) : (
                                        `${toReadableNumber(dataBalanceOf, stakingTokenInfo.decimals)} ${
                                            stakingTokenInfo.symbol
                                        }`
                                    )}
                                </span>
                            </Field>

                            {targetTokens && payoutToken && (
                                <StakingPayoutTokenSelection
                                    headline="Claiming Rewards"
                                    description="Enable this option and select a payout token in order to claim your rewards in a specific payout token. Disable this option and your rewards will be added to the merge amount."
                                    selectedToken={payoutToken}
                                    tokens={targetTokens}
                                    onSelect={onClickPayoutHandler}
                                    isOptional={true}
                                    isOptionalChecked={claimRewards}
                                    onCheckboxChange={setClaimRewards}
                                />
                            )}

                            {isLoadingAddingUpEstimation && (
                                <div className="flex justify-center rounded-lg bg-dapp-blue-800 p-5">
                                    <Spinner theme="dark" className="!h-10 !w-10" />
                                </div>
                            )}

                            {!isLoadingAddingUpEstimation && (
                                <StatsBoxTwoColumn.Wrapper className="rounded-lg bg-dapp-blue-800 px-4 py-2 text-sm">
                                    <StatsBoxTwoColumn.LeftColumn>
                                        NFT#{stake.tokenId.toString()} Stake
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        <span className="text-xs">{stakingTokenInfo.symbol}</span>{' '}
                                        {toReadableNumber(stake?.amount, stakingTokenInfo.decimals)}
                                    </StatsBoxTwoColumn.RightColumn>

                                    <StatsBoxTwoColumn.LeftColumn>Deposit Amount</StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        <span className="text-xs">{stakingTokenInfo?.symbol}</span>{' '}
                                        {toReadableNumber(amount, stakingTokenInfo.decimals)}
                                    </StatsBoxTwoColumn.RightColumn>

                                    <div className="col-span-2">
                                        <CaretDivider color="cyan" />
                                    </div>

                                    <StatsBoxTwoColumn.LeftColumn>New Stake</StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        <span className="text-xs">{stakingTokenInfo?.symbol}</span>{' '}
                                        {toReadableNumber(
                                            dataAddingUpEstimation?.stakeAmount,
                                            stakingTokenInfo.decimals
                                        )}
                                    </StatsBoxTwoColumn.RightColumn>

                                    {claimRewards && (
                                        <>
                                            <StatsBoxTwoColumn.LeftColumn>
                                                Claim Estimation
                                            </StatsBoxTwoColumn.LeftColumn>
                                            <StatsBoxTwoColumn.RightColumn>
                                                <span className="text-xs">{payoutToken.symbol}</span>{' '}
                                                {toReadableNumber(
                                                    dataAddingUpEstimation?.targetAmount,
                                                    payoutToken.decimals
                                                )}
                                            </StatsBoxTwoColumn.RightColumn>
                                        </>
                                    )}
                                </StatsBoxTwoColumn.Wrapper>
                            )}
                            <Field className="flex flex-row gap-2 px-2 text-base">
                                <Checkbox
                                    checked={isCheckboxSelected}
                                    onChange={setIsCheckboxSelected}
                                    className="size-[20px] group mt-1 block shrink-0 rounded-sm border border-dapp-cyan-50 bg-transparent data-[checked]:border-dapp-cyan-500  data-[checked]:bg-dapp-cyan-500"
                                >
                                    <svg
                                        className="stroke-white opacity-0 group-data-[checked]:opacity-100"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                    >
                                        <path
                                            d="M3 8L6 11L11 3.5"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </Checkbox>
                                <Label>
                                    {stake.locked && !stake.burned ? (
                                        <span>
                                            I understand that my previously staked {stakingTokenInfo.symbol} and my
                                            current deposit {stakingTokenInfo.symbol} will be locked for{' '}
                                            {durationFromSeconds(Number(stake.lock), {
                                                long: true,
                                            })}{' '}
                                            and can not be withdrawn during this period
                                        </span>
                                    ) : (
                                        <span>
                                            I understand that my{stake.burned && ' burned'} {stakingTokenInfo.symbol}{' '}
                                            will be aggregated to a single stake
                                        </span>
                                    )}
                                </Label>
                            </Field>
                        </div>
                    </>
                )}

            {isLoadingApprove && !isErrorApprove && (
                <div className="flex flex-col items-center gap-6 p-6 text-base">
                    <SpinnerCircular size={100} thickness={200} speed={50} color="#0F978E" secondaryColor="#DBEAE8" />
                    {hashApprove ? (
                        <div className="text-center">We&apos;re checking the allowance. Please wait...</div>
                    ) : (
                        <div className="text-center">
                            Your wallet is prompting you to allow the staking protocol to transfer
                            <br />
                            <span className="text-xl font-bold">
                                {toReadableNumber(amount, stakingTokenInfo.decimals)} {stakingTokenInfo.symbol}
                            </span>
                            <br />
                            from your account into staking. Confirm this to proceed.
                        </div>
                    )}
                </div>
            )}

            {isLoadingAddUp && !isErrorAddUp && (
                <div className="flex flex-col items-center gap-6 p-6 text-base">
                    <SpinnerCircular size={100} thickness={200} speed={50} color="#0F978E" secondaryColor="#DBEAE8" />
                    {!hashAddUp ? (
                        <div className="text-center">
                            Your wallet is prompting you <br />
                            to confirm a deposit of <br />
                            <span className="text-xl font-bold">
                                {toReadableNumber(amount, stakingTokenInfo.decimals)} {stakingTokenInfo.symbol}
                            </span>
                            {Boolean(dataAddingUpEstimation?.targetAmount) && (
                                <>
                                    <br /> and a claim of <br />
                                    <span className="text-xl font-bold">
                                        {toReadableNumber(dataAddingUpEstimation?.targetAmount, payoutToken?.decimals)}{' '}
                                        {payoutToken?.symbol}
                                    </span>
                                    <br />
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">Waiting for deposit to be finished...</div>
                    )}
                </div>
            )}

            {(isErrorAddUp || isErrorApprove) && (
                <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                    <MdError className="size-[100px] text-error " />
                    There was an error: <br />
                    {errorAddUp && (errorAddUp as any).cause.shortMessage}
                    {errorApprove && (errorApprove as any).cause.shortMessage}
                </div>
            )}

            {!isLoadingAddUp && isSuccessAddUp && (
                <>
                    <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                        <IoCheckmarkCircle className="size-[100px] text-success" />
                        <span>
                            Successfully deposited <br />
                            <span className="text-xl font-bold">
                                {toReadableNumber(amount, stakingTokenInfo.decimals)} {stakingTokenInfo.symbol}
                            </span>
                            <br /> to a total stake of <br />
                            <span className="text-xl font-bold">
                                {toReadableNumber(stakedAmount, stakingTokenInfo.decimals)} {stakingTokenInfo.symbol}
                            </span>
                            {claimRewards && Boolean(claimedAmount) && (
                                <>
                                    <br />
                                    <br />
                                    You also claimed <br />
                                    <span className="text-xl font-bold">
                                        {toReadableNumber(claimedAmount, payoutToken?.decimals)} {payoutToken?.symbol}
                                    </span>
                                </>
                            )}
                        </span>
                    </div>
                    <Button
                        variant="primary"
                        onClick={onClickCloseButtonHandler}
                        className="mt-2 flex w-full items-center justify-center gap-2"
                    >
                        Close
                    </Button>
                </>
            )}

            {!isLoading &&
                !isSuccessAddUp &&
                !isLoadingAddUp &&
                !isErrorAddUp &&
                !isSuccessApprove &&
                !isLoadingApprove &&
                !isErrorApprove && (
                    <Button
                        disabled={!isReady}
                        variant="primary"
                        onClick={onClickButtonHandler}
                        className="mt-6 flex w-full items-center justify-center gap-2"
                    >
                        Add {stakingTokenInfo.symbol}
                        {claimRewards && <span> & Claim</span>}
                    </Button>
                )}

            {!isLoading && ((!isSuccessAddUp && isErrorAddUp) || (!isSuccessApprove && isErrorApprove)) && (
                <div>
                    <Button
                        variant="primary"
                        onClick={onClickTryAgainButtonHandler}
                        className="mt-6 flex w-full items-center justify-center gap-2"
                    >
                        Try again
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={onClickCancelButtonHandler}
                        className="mt-2 flex w-full items-center justify-center gap-2"
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </BaseOverlay>
    )
}
