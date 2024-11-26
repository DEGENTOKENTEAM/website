import { toReadableNumber } from '@dapphelpers/number'
import { useBucketsGetStakeBuckets } from '@dapphooks/staking/useBucketsGetStakeBuckets'
import { useGetUpstakingEstimation } from '@dapphooks/staking/useGetUpstakingEstimation'
import { useUpstake } from '@dapphooks/staking/useUpstake'
import { CaretDivider } from '@dappshared/CaretDivider'
import { BaseOverlay, BaseOverlayProps } from '@dappshared/overlays/BaseOverlay'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { StakeBucket, StakeResponse, TokenInfo, TokenInfoResponse } from '@dapptypes'
import { Tooltip } from 'flowbite-react'
import { isBoolean, pick } from 'lodash'
import { useCallback, useContext, useEffect, useState } from 'react'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { FaArrowLeft } from 'react-icons/fa'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { MdError } from 'react-icons/md'
import { SpinnerCircular } from 'spinners-react'
import { Button } from 'src/components/Button'
import { Address } from 'viem'
import { Spinner } from '../../elements/Spinner'
import { StakeBucketButton, StakingDurationSelection } from '../StakingDurationSelection'
import { StakingPayoutTokenSelection } from '../StakingPayoutTokenSelection'
import { StakeXContext } from '@dapphelpers/staking'

type StakingUpstakeOverlayProps = {
    protocolAddress: Address
    chainId: number
    tokens: TokenInfoResponse[]
    stakingTokenInfo: TokenInfoResponse
    payoutTokenInfo: TokenInfo
    stake: StakeResponse
} & BaseOverlayProps

export const StakingUpstakeOverlay = ({
    isOpen,
    onClose,
    tokens,
    protocolAddress,
    chainId,
    stakingTokenInfo,
    payoutTokenInfo,
    stake,
}: StakingUpstakeOverlayProps) => {
    const { tokenId } = stake
    const {
        data: { actionFeeActive, actionFeeThreshold },
    } = useContext(StakeXContext)

    const [isLoading, setIsLoading] = useState(true)

    //
    // Stake Bucket State
    //
    const [isCheckboxSelected, setIsCheckboxSelected] = useState(false)
    const [stakeBucketId, setStakeBucketId] = useState<Address>()
    const [selectedStake, setSelectedStake] = useState<StakeBucket>()
    const [durationButtons, setDurationButtons] = useState<StakeBucketButton[]>()

    //
    // Payout State
    //
    const [payoutToken, setPayoutToken] = useState<TokenInfo>(payoutTokenInfo)
    const [targetTokens, setTargetTokens] = useState<TokenInfoResponse[]>([])
    const [claimRewards, setClaimRewards] = useState(true)

    //
    //  Stake Bucket Data Hooks
    //
    const { data: stakeBucketsData, isLoading: isLoadingGetStakeBuckets } = useBucketsGetStakeBuckets(
        protocolAddress,
        chainId
    )

    //
    // Upstaking & Estimations
    //
    const {
        data: dataUpstakingEstimation,
        isLoading: isLoadingUpstakingEstimation,
        refetch: refetchUpstakingEstimation,
    } = useGetUpstakingEstimation(protocolAddress, chainId, stake.tokenId, !claimRewards, payoutToken.source)

    const {
        write,
        isLoading: isLoadingUpstake,
        isSuccess: isSuccessUpstake,
        isError: isError,
        error,
        reset,
        upstakeAmount,
        feeAmount,
        claimedAmount,
        hash: hashUpstake,
    } = useUpstake(
        isCheckboxSelected && Boolean(stakeBucketId && payoutToken && payoutToken.source) && isBoolean(claimRewards),
        protocolAddress,
        chainId,
        tokenId,
        stakeBucketId!,
        !claimRewards,
        payoutToken.source,
        actionFeeActive,
        actionFeeThreshold
    )

    //
    // Handlers
    //
    const onClickHandler = useCallback(() => {
        write && write()
    }, [write])

    const onCloseHandler = () => {
        reset()
        onClose && onClose()
    }

    const onCheckboxHandler = (checked: boolean) => checked != isCheckboxSelected && setIsCheckboxSelected(checked)

    const onDurationSelectionHandler = (duration: StakeBucketButton) => setStakeBucketId(duration?.id)

    const onClickTryAgainButtonHandler = () => {
        reset()
        setStakeBucketId(undefined)
        setSelectedStake(undefined)
        setIsCheckboxSelected(false)
    }

    const onClickCancelButtonHandler = () => {
        onCloseHandler()
    }

    const onClickCloseButtonHandler = () => {
        onCloseHandler()
    }

    const onClickPayoutHandler = (target: TokenInfoResponse) => {
        if (payoutToken?.source != target.source)
            setPayoutToken(pick(target, ['name', 'symbol', 'decimals', 'source']) as TokenInfo)
    }

    //
    // Effects
    //

    //
    // Effects Stake Bucket
    //
    useEffect(() => {
        setIsLoading(isLoadingGetStakeBuckets || !tokens)
    }, [isLoadingGetStakeBuckets, tokens])

    useEffect(() => {
        if (stakeBucketsData) {
            setDurationButtons(
                stakeBucketsData.map(
                    ({ id, duration, burn, multiplier }) =>
                        ({
                            id,
                            multiplier,
                            duration,
                            burn,
                            selected: id === stakeBucketId || stakeBucketsData.length === 1,
                        } as StakeBucketButton)
                )
            )

            if (stakeBucketId) {
                setSelectedStake(
                    stakeBucketsData.find(({ id }) => id === stakeBucketId || stakeBucketsData.length === 1)
                )
            } else setSelectedStake(undefined)

            if (stakeBucketsData.length === 1) setIsCheckboxSelected(true)
        }
    }, [stakeBucketsData, stakeBucketId])

    //
    // Effects Payout Tokens
    //
    useEffect(() => {
        if (tokens && tokens.length > 0) {
            setTargetTokens(tokens.filter((token) => token.isTarget))
        } else setTargetTokens([])
    }, [tokens])

    useEffect(() => {
        if (tokenId && payoutToken && refetchUpstakingEstimation) refetchUpstakingEstimation()
    }, [tokenId, payoutToken, refetchUpstakingEstimation])

    return (
        <BaseOverlay isOpen={isOpen} closeOnBackdropClick={false} onClose={onCloseHandler}>
            {isLoading && (
                <div className="flex flex-row items-center justify-center">
                    <Spinner theme="dark" className="m-20 !h-24 !w-24" />
                </div>
            )}

            {!isLoading && !isLoadingUpstake && !isSuccessUpstake && !isError && (
                <>
                    <div className="flex flex-col gap-6 text-base">
                        <h3 className="flex flex-row items-center gap-3 text-xl">
                            <div className="font-title">Upstake</div>
                            <div>
                                <Tooltip
                                    content="This is a special function to move your current stake into the next higher lock"
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

                        {durationButtons && (
                            <StakingDurationSelection
                                description="Choose the multipler you you want to upstake to"
                                tokenSymbol={stakingTokenInfo.symbol}
                                durations={durationButtons}
                                onCheckbox={onCheckboxHandler}
                                onDurationSelection={onDurationSelectionHandler}
                                isCheckboxSelected={isCheckboxSelected}
                                durationsDisabled={durationButtons.reduce<Address[]>((acc, duration) => {
                                    if (duration.duration <= stake.lock && !duration.burn) acc.push(duration.id)
                                    return acc
                                }, [])}
                            />
                        )}

                        {targetTokens && payoutToken && (
                            <StakingPayoutTokenSelection
                                headline="Claiming Rewards"
                                description="Enable this option and select a payout token in order to claim your rewards in a specific payout token. Disable this option and your rewards will be added to the upstake amount."
                                selectedToken={payoutToken}
                                tokens={targetTokens}
                                onSelect={onClickPayoutHandler}
                                isOptional={true}
                                isOptionalChecked={claimRewards}
                                onCheckboxChange={setClaimRewards}
                            />
                        )}

                        <StatsBoxTwoColumn.Wrapper className="rounded-lg bg-dapp-blue-800 px-4 py-2 text-sm">
                            <StatsBoxTwoColumn.LeftColumn>New Stake Estimate</StatsBoxTwoColumn.LeftColumn>
                            <StatsBoxTwoColumn.RightColumn>
                                {isLoadingUpstakingEstimation ? (
                                    <div className="flex justify-end">
                                        <Spinner theme="dark" className="!h-4 !w-4" />
                                    </div>
                                ) : (
                                    <span>
                                        {stakingTokenInfo.symbol}{' '}
                                        {toReadableNumber(
                                            dataUpstakingEstimation?.stakeAmount,
                                            stakingTokenInfo.decimals
                                        )}
                                    </span>
                                )}
                            </StatsBoxTwoColumn.RightColumn>

                            {dataUpstakingEstimation && dataUpstakingEstimation.feeAmount > 0 && (
                                <>
                                    <StatsBoxTwoColumn.LeftColumn>Upstaking Fee</StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        <span>
                                            {stakingTokenInfo.symbol}{' '}
                                            {toReadableNumber(
                                                dataUpstakingEstimation?.feeAmount,
                                                stakingTokenInfo.decimals
                                            )}
                                        </span>
                                    </StatsBoxTwoColumn.RightColumn>
                                </>
                            )}

                            {claimRewards && (
                                <>
                                    <StatsBoxTwoColumn.LeftColumn>Claim Estimate</StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {isLoadingUpstakingEstimation ? (
                                            <div className="flex justify-end">
                                                <Spinner theme="dark" className="!h-4 !w-4" />
                                            </div>
                                        ) : (
                                            <span>
                                                {payoutToken.symbol}{' '}
                                                {toReadableNumber(
                                                    dataUpstakingEstimation?.targetAmount,
                                                    payoutToken.decimals
                                                )}
                                            </span>
                                        )}
                                    </StatsBoxTwoColumn.RightColumn>
                                </>
                            )}

                            <div className="col-span-2">
                                <CaretDivider color="cyan" />
                            </div>

                            <StatsBoxTwoColumn.LeftColumn>Est. Unlock Date</StatsBoxTwoColumn.LeftColumn>
                            <StatsBoxTwoColumn.RightColumn>
                                {selectedStake ? (
                                    !selectedStake.burn ? (
                                        `${new Date(
                                            (Number(stake.release) + selectedStake.duration) * 1000
                                        ).toLocaleDateString(navigator.language, {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                        })}, ${new Date(
                                            (Number(stake.release) + selectedStake.duration) * 1000
                                        ).toLocaleTimeString(navigator.language)}`
                                    ) : (
                                        <span className="font-bold text-degenOrange">BURNED</span>
                                    )
                                ) : (
                                    '-'
                                )}
                            </StatsBoxTwoColumn.RightColumn>
                        </StatsBoxTwoColumn.Wrapper>
                    </div>
                    <Button
                        disabled={!isCheckboxSelected || !stakeBucketId}
                        variant="primary"
                        onClick={onClickHandler}
                        className="mt-6 flex w-full items-center justify-center gap-2"
                    >
                        {isLoadingUpstake ? (
                            <>
                                <Spinner theme="dark" className="!h-4 !w-4" /> <span>processing...</span>
                            </>
                        ) : (
                            <span>Upstake</span>
                        )}
                    </Button>
                </>
            )}

            {isLoadingUpstake && dataUpstakingEstimation && (
                <div className="flex flex-col items-center gap-6 p-6 text-base">
                    <SpinnerCircular size={100} thickness={200} speed={50} color="#0F978E" secondaryColor="#DBEAE8" />
                    {!hashUpstake ? (
                        <div className="flex flex-col gap-4 text-center">
                            <div>
                                Your wallet is prompting you <br />
                                to confirm an upstake of
                                <br />
                                <span className="text-xl font-bold">
                                    {toReadableNumber(dataUpstakingEstimation.stakeAmount, stakingTokenInfo.decimals)}{' '}
                                    {stakingTokenInfo.symbol}
                                </span>
                                <br />
                            </div>

                            {dataUpstakingEstimation.feeAmount > 0n && (
                                <div>
                                    With this you&apos;ll be charged with an upstaking fee of <br />
                                    <span className="text-xl font-bold">
                                        {toReadableNumber(
                                            dataUpstakingEstimation?.feeAmount,
                                            stakingTokenInfo.decimals
                                        )}{' '}
                                        {stakingTokenInfo.symbol}
                                    </span>
                                </div>
                            )}

                            {dataUpstakingEstimation.targetAmount > 0n && (
                                <div>
                                    You&apos;re about to claim an estimated amount of <br />
                                    <span className="text-xl font-bold">
                                        {toReadableNumber(dataUpstakingEstimation?.targetAmount, payoutToken.decimals)}{' '}
                                        {payoutToken.symbol}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">Waiting for transaction to be processed...</div>
                    )}
                </div>
            )}

            {isError && !isLoading && !isSuccessUpstake && !isLoadingUpstake && (
                <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                    <MdError className="size-[100px] text-error " />
                    There was an error: <br />
                    {error && (error as any).details}
                </div>
            )}

            {!isLoading && !isSuccessUpstake && isError && (
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

            {!isLoadingUpstake && isSuccessUpstake && (
                <>
                    <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                        <IoCheckmarkCircle className="size-[100px] text-success" />
                        <span>
                            Successfully upstaked <br />
                            <span className="text-xl font-bold">
                                {toReadableNumber(upstakeAmount, stakingTokenInfo?.decimals)} {stakingTokenInfo?.symbol}
                            </span>
                            {typeof feeAmount === 'bigint' && feeAmount > 0n && (
                                <>
                                    <br />
                                    <br />A fee of {toReadableNumber(feeAmount, stakingTokenInfo?.decimals)}{' '}
                                    {stakingTokenInfo?.symbol} has been charged from your upstaking amount
                                </>
                            )}
                            {claimRewards && typeof claimedAmount === 'bigint' && claimedAmount > 0n && (
                                <>
                                    <br />
                                    <br />
                                    You received your reward of {toReadableNumber(
                                        claimedAmount,
                                        payoutToken?.decimals
                                    )}{' '}
                                    {payoutToken?.symbol},
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
        </BaseOverlay>
    )
}
