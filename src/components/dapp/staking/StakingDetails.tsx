import { toReadableNumber } from '@dapphelpers/number'
import { StakeXContext, durationFromSeconds } from '@dapphelpers/staking'
import { useAddingUpActive } from '@dapphooks/staking/useAddingUpActive'
import { useBucketsGetStakeBuckets } from '@dapphooks/staking/useBucketsGetStakeBuckets'
import { useGetRewardEstimationForTokens } from '@dapphooks/staking/useGetRewardEstimationForTokens'
import { BucketStakedShare, useGetStakedSharesByStaker } from '@dapphooks/staking/useGetStakedSharesByStaker'
import { useMergeActive } from '@dapphooks/staking/useMergeActive'
import { useUpstakeActive } from '@dapphooks/staking/useUpstakeActive'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { StakeBucket, StakeResponse, StakingBaseProps, TokenInfoResponse } from '@dapptypes'
import { Fragment, useContext, useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '../../Button'
import { Spinner } from '../elements/Spinner'
import { StakingNFTTile } from './StakingNFTTile'
import { SortOption, StakingSortOptions } from './StakingSortOptions'
import { StakingAddingUpOverlay } from './overlays/StakingAddingUpOverlay'
import { StakingClaimOverlay } from './overlays/StakingClaimOverlay'
import { StakingMergeOverlay } from './overlays/StakingMergeOverlay'
import { StakingRestakeOverlay } from './overlays/StakingRestakeOverlay'
import { StakingUpstakeOverlay } from './overlays/StakingUpstakeOverlay'
import { StakingWithdrawOverlay } from './overlays/StakingWithdrawOverlay'

type StakingDetailsProps = {
    stakes: readonly StakeResponse[]
    defaultShowToken: TokenInfoResponse
    defaultPayoutToken: TokenInfoResponse
}

type BucketStakedShareInfo = Partial<BucketStakedShare & StakeBucket>

type ComponentProps = StakingBaseProps & StakingDetailsProps

export const StakingDetails = ({ stakingTokenInfo, defaultShowToken, defaultPayoutToken, stakes }: ComponentProps) => {
    const {
        data: { protocol, chain, tokens },
    } = useContext(StakeXContext)

    const [selectedSortOption, setSelectedSortOption] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [totalStakedAmount, setTotalStakedAmount] = useState(0n)
    const [unclaimedRewards, setUnclaimedRewards] = useState(0n)
    const [activeStakesCount, setActiveStakeCount] = useState(2)
    const [tokenIds, setTokenIds] = useState<bigint[]>()
    const [tokenIdRewards, setTokenIdRewards] = useState<{
        [tokenId: number]: bigint
    }>({})
    const [canClaimAll, setCanClaimAll] = useState(false)
    const [bucketStakes, setBucketStakes] = useState<{ [key: string]: number }>()

    const [hasBurnBuckets, setHasBurnBuckets] = useState(false)
    const [largestLock, setLargestLock] = useState(0n)

    const [stakesOrdered, setStakesOrdered] = useState<StakeResponse[]>()
    const [stakeShareInfo, setStakeShareInfo] = useState<
        {
            share: bigint
            staked: bigint
            divider: bigint
            duration: bigint
            burn: boolean
            active: boolean
        }[]
    >()

    // processing / cta / interative
    const [isInProgess, setIsInProgess] = useState(false)
    const [isInProgessClaimAll, setIsInProgessClaimAll] = useState(false)
    const [isInProgessClaim, setIsInProgessClaim] = useState(false)
    const [isInProgessRestake, setIsInProgessRestake] = useState(false)
    const [isInProgessWithdraw, setIsInProgessWithdraw] = useState(false)
    const [isInProgessUpstake, setIsInProgessUpstake] = useState(false)
    const [isInProgessMerge, setIsInProgessMerge] = useState(false)
    const [isInProgessAddUp, setIsInProgessAddUp] = useState(false)
    const [tokenIdToClaim, setTokenIdToClaim] = useState<bigint>()
    const [tokenIdToRestake, setTokenIdToRestake] = useState<bigint>()
    const [tokenIdToWithdraw, setTokenIdToWithdraw] = useState<bigint>()
    const [tokenIdToUpstake, setTokenIdToUpstake] = useState<bigint>()
    const [tokenIdToMerge, setTokenIdToMerge] = useState<bigint>()
    const [tokenIdToAddUp, setTokenIdToAddUp] = useState<bigint>()

    const { refetchStakes } = useContext(StakeXContext)
    const { address } = useAccount()

    const { data: rewardEstimations, refetch: refetchRewardEstimations } = useGetRewardEstimationForTokens(
        protocol,
        chain?.id!,
        tokenIds!,
        defaultShowToken?.source
    )
    const { data: dataGetStakedSharesByStaker, refetch: refetchGetStakedSharesByStaker } = useGetStakedSharesByStaker(
        protocol,
        chain?.id!,
        address!
    )

    const { data: dataGetStakeBuckets } = useBucketsGetStakeBuckets(protocol, chain?.id!, true)
    const { data: dataAddingUpActive } = useAddingUpActive(protocol, chain?.id!)
    const { data: dataUpstakeActive } = useUpstakeActive(protocol, chain?.id!)
    const { data: dataMergeActive } = useMergeActive(protocol, chain?.id!)

    const sortOptions: SortOption[] = useMemo(
        () =>
            [
                stakes.length > 0
                    ? {
                          label: 'Most recent stake',
                          by: 'tokenId',
                          sort: 'DESC',
                      }
                    : null,
                {
                    label: 'Oldest stake',
                    by: 'tokenId',
                    sort: 'ASC',
                },
                hasBurnBuckets
                    ? {
                          label: 'Burned stakes first',
                          by: 'burned',
                          sort: 'DESC',
                      }
                    : null,
                {
                    label: 'Most staked',
                    by: 'amount',
                    sort: 'DESC',
                },
                largestLock > 0n
                    ? {
                          label: 'Next unlocked stake',
                          by: 'release',
                          sort: 'ASC',
                      }
                    : null,
            ].filter((item) => item) as SortOption[],
        [hasBurnBuckets, largestLock, stakes.length]
    )

    //
    // Handlers
    //

    //
    // Claim all
    //
    const onClaimAllHandler = () => {
        setIsInProgessClaimAll(true)
    }

    const onClaimAllCloseHandler = () => {
        refetchStakes && refetchStakes()
        refetchGetStakedSharesByStaker && refetchGetStakedSharesByStaker()
        refetchRewardEstimations && refetchRewardEstimations()
        setIsInProgessClaimAll(false)
    }

    //
    // Claim
    //
    const onClaimHandler = (tokenId: bigint) => {
        setTokenIdToClaim(tokenId)
        setIsInProgessClaim(true)
    }

    const onClaimCloseHandler = () => {
        refetchRewardEstimations && refetchRewardEstimations()
        refetchGetStakedSharesByStaker && refetchGetStakedSharesByStaker()
        setIsInProgessClaim(false)
    }

    //
    // Restake
    //
    const onRestakeHandler = (tokenId: bigint) => {
        setTokenIdToRestake(tokenId)
        setIsInProgessRestake(true)
    }

    const onRestakeCloseHandler = () => {
        refetchStakes && refetchStakes()
        refetchGetStakedSharesByStaker && refetchGetStakedSharesByStaker()
        setIsInProgessRestake(false)
    }

    //
    // Withdraw
    //
    const onWithdrawHandler = (tokenId: bigint) => {
        setTokenIdToWithdraw(tokenId)
        setIsInProgessWithdraw(true)
    }

    const onWithdrawCloseHandler = () => {
        refetchStakes && refetchStakes()
        refetchGetStakedSharesByStaker && refetchGetStakedSharesByStaker()
        setIsInProgessWithdraw(false)
    }

    //
    // Upstake
    //
    const onUpstakeHandler = (tokenId: bigint) => {
        setTokenIdToUpstake(tokenId)
        setIsInProgessUpstake(true)
    }

    const onUpstakeCloseHandler = () => {
        refetchStakes && refetchStakes()
        refetchGetStakedSharesByStaker && refetchGetStakedSharesByStaker()
        setIsInProgessUpstake(false)
    }

    //
    // Merge
    //
    const onMergeHandler = (tokenId: bigint) => {
        setTokenIdToMerge(tokenId)
        setIsInProgessMerge(true)
    }

    const onMergeCloseHandler = () => {
        refetchStakes && refetchStakes()
        refetchGetStakedSharesByStaker && refetchGetStakedSharesByStaker()
        setIsInProgessMerge(false)
    }

    //
    // Add up
    //
    const onAddUpHandler = (tokenId: bigint) => {
        setTokenIdToAddUp(tokenId)
        setIsInProgessAddUp(true)
    }

    const onAddUpCloseHandler = () => {
        refetchStakes && refetchStakes()
        refetchGetStakedSharesByStaker && refetchGetStakedSharesByStaker()
        setIsInProgessAddUp(false)
    }

    //
    // effects
    //

    useEffect(() => {
        setIsInProgess(isInProgessClaimAll || isInProgessClaim || isInProgessRestake || isInProgessWithdraw)
    }, [isInProgessClaimAll, isInProgessClaim, isInProgessRestake, isInProgessWithdraw])

    useEffect(() => {
        if (dataGetStakeBuckets) {
            if (dataGetStakedSharesByStaker) {
                setStakeShareInfo(
                    dataGetStakedSharesByStaker.map((share) => {
                        const bucketData = dataGetStakeBuckets.find((bucket) => share.bucketId == bucket.id)
                        return {
                            burn: bucketData?.burn!,
                            divider: BigInt(share.divider),
                            duration: BigInt(bucketData?.duration!),
                            share: share.share,
                            staked: share.staked,
                            active: Boolean(bucketData?.active),
                        }
                    })
                )
            }
            setHasBurnBuckets(Boolean(dataGetStakeBuckets.find((bucket) => bucket.burn)))
            setLargestLock(
                dataGetStakeBuckets.reduce(
                    (acc, bucket) => (acc < BigInt(bucket.duration) ? BigInt(bucket.duration) : acc),
                    0n
                )
            )
        }
    }, [dataGetStakedSharesByStaker, dataGetStakeBuckets])

    useEffect(() => {
        if (tokenIds && rewardEstimations && tokenIds.length > 0 && tokenIds.length == rewardEstimations.length) {
            setTokenIdRewards(
                tokenIds.reduce(
                    (acc, tokenId, i) => ({
                        ...acc,
                        [parseInt(tokenId.toString())]: rewardEstimations[i]?.amount,
                    }),
                    {}
                )
            )

            const rewards = tokenIds.reduce((acc, _, i) => acc + BigInt(rewardEstimations[i]?.amount.toString()), 0n)

            setCanClaimAll(rewards > 0n)
            setUnclaimedRewards(rewards)
        }
    }, [tokenIds, rewardEstimations])

    useEffect(() => {
        if (isInProgess) return

        if (stakes && stakes.length > 0) {
            setTokenIds(stakes.map((stake) => stake.tokenId))
            setTotalStakedAmount(stakes.reduce((acc, { amount }) => acc + BigInt(amount.toString()), 0n))
            setActiveStakeCount(stakes.length)

            // order stakes
            const { by, sort } = sortOptions[selectedSortOption]
            setStakesOrdered([
                ...stakes.filter((stake) => by == 'burned' && stake.burned),
                ...stakes
                    .filter((stake) => (by == 'burned' || by == 'release' ? !stake.burned : true))
                    .sort((curr, prev) => {
                        return parseInt(curr[by].toString()) > parseInt(prev[by].toString())
                            ? sort == 'ASC'
                                ? 1
                                : -1
                            : sort == 'ASC'
                            ? -1
                            : 1
                    }),
                ...stakes.filter((stake) => by == 'release' && stake.burned),
            ])
            setBucketStakes(
                stakes.reduce((acc, stake) => {
                    if (!acc[stake.bucketId]) acc[stake.bucketId] = 0
                    acc[stake.bucketId]++
                    return acc
                }, {})
            )
        } else {
            setTokenIds([])
            setTotalStakedAmount(0n)
            setActiveStakeCount(0)
        }
    }, [stakes, selectedSortOption, sortOptions, isInProgess])

    useEffect(() => {
        setIsLoading(
            !Boolean(rewardEstimations && rewardEstimations.length && tokens && tokens.length && defaultShowToken)
        )
    }, [rewardEstimations, tokens, defaultShowToken])

    return isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4">
            <Spinner theme="dark" className="!h-10 !w-10" />
            Loading Your Stakes...
        </div>
    ) : (
        <>
            <div className="flex flex-col gap-8">
                <StatsBoxTwoColumn.Wrapper className="rounded-lg bg-dapp-blue-800 px-4 py-2 text-base">
                    <StatsBoxTwoColumn.LeftColumn>
                        <span className="text-darkTextLowEmphasis">Staked {stakingTokenInfo?.symbol}</span>
                    </StatsBoxTwoColumn.LeftColumn>
                    <StatsBoxTwoColumn.RightColumn>
                        {toReadableNumber(totalStakedAmount, stakingTokenInfo?.decimals)}
                    </StatsBoxTwoColumn.RightColumn>

                    {stakeShareInfo && stakeShareInfo.length == 1 && (
                        <>
                            <StatsBoxTwoColumn.LeftColumn>
                                <span className="text-darkTextLowEmphasis">Your Share</span>
                            </StatsBoxTwoColumn.LeftColumn>
                            <StatsBoxTwoColumn.RightColumn>
                                {`${toReadableNumber(
                                    Number(stakeShareInfo[0].share) / Number(stakeShareInfo[0].divider),
                                    0,
                                    { maximumFractionDigits: 2 }
                                )}%`}
                            </StatsBoxTwoColumn.RightColumn>
                        </>
                    )}

                    <StatsBoxTwoColumn.LeftColumn>
                        <span className="text-darkTextLowEmphasis">Unclaimed Rewards</span>
                    </StatsBoxTwoColumn.LeftColumn>
                    <StatsBoxTwoColumn.RightColumn>
                        <span className="mr-2">{defaultShowToken?.symbol}</span>
                        {toReadableNumber(unclaimedRewards, defaultShowToken?.decimals)}
                    </StatsBoxTwoColumn.RightColumn>

                    {stakeShareInfo && stakeShareInfo.length > 1 && (
                        <>
                            <div className="col-span-2">
                                <CaretDivider />
                            </div>
                            <StatsBoxTwoColumn.LeftColumn>
                                <span className="font-bold text-darkTextLowEmphasis">Pool</span>
                            </StatsBoxTwoColumn.LeftColumn>
                            <StatsBoxTwoColumn.RightColumn>
                                <div className="flex flex-row items-center justify-end gap-1 font-bold text-darkTextLowEmphasis">
                                    Staked <span className="text-xs">(%)</span>
                                </div>
                            </StatsBoxTwoColumn.RightColumn>

                            {stakeShareInfo
                                .filter((share) => share.active)
                                .sort((a, b) => (a.duration > b.duration ? 1 : -1))
                                .sort((a, b) => (a.burn != b.burn ? -1 : 1))
                                .map((share, i) => (
                                    <Fragment key={i}>
                                        <StatsBoxTwoColumn.LeftColumn>
                                            <span className="text-darkTextLowEmphasis">
                                                {share.burn ? (
                                                    <span className="font-bold text-degenOrange opacity-60">
                                                        BURNED
                                                    </span>
                                                ) : Boolean(share.duration) ? (
                                                    durationFromSeconds(Number(share.duration), {
                                                        long: true,
                                                    })
                                                ) : (
                                                    'Standard'
                                                )}
                                            </span>
                                        </StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            <div className="flex flex-row items-center justify-end gap-1">
                                                {toReadableNumber(Number(share.staked), stakingTokenInfo.decimals, {
                                                    minimumFractionDigits: 3,
                                                    maximumFractionDigits: 3,
                                                })}
                                                <span className="text-xs">
                                                    {`(${
                                                        Number(share.share) / Number(share.divider) < 0.01
                                                            ? '<0.01'
                                                            : toReadableNumber(
                                                                  Number(share.share) / Number(share.divider),
                                                                  0,
                                                                  {
                                                                      maximumFractionDigits: 2,
                                                                  }
                                                              )
                                                    }%)`}
                                                </span>
                                            </div>
                                        </StatsBoxTwoColumn.RightColumn>
                                    </Fragment>
                                ))}
                        </>
                    )}

                    {/* <StatsBoxTwoColumn.LeftColumn>
                    <span className="text-darkTextLowEmphasis">
                        Claimed Rewards
                    </span>
                </StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <span className="mr-2">{currentTargetToken?.symbol}</span>{' '}
                    123654567
                </StatsBoxTwoColumn.RightColumn> */}
                </StatsBoxTwoColumn.Wrapper>

                <Button
                    disabled={!canClaimAll || isInProgessClaimAll}
                    variant="primary"
                    onClick={onClaimAllHandler}
                    className="flex items-center justify-center gap-2"
                >
                    {isInProgessClaimAll ? (
                        <>
                            <Spinner theme="dark" className="!h-4 !w-4" /> <span>processing...</span>
                        </>
                    ) : (
                        <span>Claim All Rewards</span>
                    )}
                </Button>

                <div>
                    <div className="flex flex-row px-2">
                        <div className="grow text-base text-dapp-cyan-50">
                            Your Active Stakes
                            <span className="ml-4 text-xs text-darkTextLowEmphasis">({activeStakesCount})</span>
                        </div>
                        <div>
                            <StakingSortOptions
                                onChangeSorting={setSelectedSortOption}
                                sortOptions={sortOptions}
                                selectedSortOption={selectedSortOption}
                            />
                        </div>
                    </div>
                    <div className="mt-3 flex flex-col gap-3">
                        {dataGetStakeBuckets &&
                            dataGetStakeBuckets.length &&
                            stakesOrdered &&
                            stakesOrdered.length &&
                            stakesOrdered.map((stake) => (
                                <StakingNFTTile
                                    key={`key-${stake.tokenId}`}
                                    protocolAddress={protocol}
                                    chainId={chain?.id!}
                                    rewardAmount={toReadableNumber(
                                        tokenIdRewards[Number(stake.tokenId)],
                                        defaultShowToken?.decimals
                                    )}
                                    rewardSymbol={defaultShowToken?.symbol}
                                    stakedTokenAmount={toReadableNumber(stake.amount, stakingTokenInfo.decimals)}
                                    stakedTokenSymbol={stakingTokenInfo?.symbol}
                                    tokenId={stake.tokenId}
                                    lockDuration={Number(stake.lock)}
                                    withdrawDate={Number(stake.release)}
                                    lockStartDate={Number(stake.lockStart)}
                                    isBurned={stake.burned}
                                    isLocked={stake.locked}
                                    canClaim={
                                        Boolean(tokenIdRewards[Number(stake.tokenId)] > 0n) &&
                                        dataGetStakeBuckets.find((bucket) => bucket.id == stake.bucketId)?.active!
                                    }
                                    canRestake={
                                        Boolean(tokenIdRewards[Number(stake.tokenId)] > 0n) &&
                                        dataGetStakeBuckets.find((bucket) => bucket.id == stake.bucketId)?.active!
                                    }
                                    canWithdraw={!stake.locked}
                                    canUpstake={
                                        ((!stake.burned && hasBurnBuckets) || stake.lock > largestLock) &&
                                        Boolean(dataUpstakeActive)
                                    }
                                    canMerge={Boolean(
                                        bucketStakes && bucketStakes[stake.bucketId] > 1 && dataMergeActive
                                    )}
                                    canAddUp={Boolean(dataAddingUpActive)}
                                    onClaim={onClaimHandler}
                                    onRestake={onRestakeHandler}
                                    onWithdraw={onWithdrawHandler}
                                    onUpstake={onUpstakeHandler}
                                    onMerge={onMergeHandler}
                                    onAddUp={onAddUpHandler}
                                />
                            ))}
                    </div>
                </div>
            </div>
            {isInProgessClaimAll && (
                <StakingClaimOverlay
                    protocolAddress={protocol}
                    chainId={chain?.id!}
                    tokens={tokens}
                    targetToken={defaultPayoutToken}
                    isClaimAll={true}
                    isOpen={true}
                    onClose={onClaimAllCloseHandler}
                />
            )}
            {isInProgessClaim && tokenIdToClaim && (
                <StakingClaimOverlay
                    protocolAddress={protocol}
                    chainId={chain?.id!}
                    tokens={tokens}
                    targetToken={defaultPayoutToken}
                    tokenId={tokenIdToClaim}
                    isOpen={true}
                    onClose={onClaimCloseHandler}
                />
            )}
            {isInProgessRestake && tokenIdToRestake && (
                <StakingRestakeOverlay
                    protocolAddress={protocol}
                    chainId={chain?.id!}
                    stakingTokenInfo={stakingTokenInfo}
                    payoutTokenInfo={defaultPayoutToken}
                    tokenId={tokenIdToRestake}
                    isOpen={true}
                    onClose={onRestakeCloseHandler}
                />
            )}
            {isInProgessWithdraw && tokenIdToWithdraw && (
                <StakingWithdrawOverlay
                    protocolAddress={protocol}
                    chainId={chain?.id!}
                    tokens={tokens}
                    stakingTokenInfo={stakingTokenInfo}
                    payoutTokenInfo={defaultPayoutToken}
                    tokenId={tokenIdToWithdraw}
                    isOpen={true}
                    onClose={onWithdrawCloseHandler}
                />
            )}
            {isInProgessUpstake && tokenIdToUpstake && (
                <StakingUpstakeOverlay
                    protocolAddress={protocol}
                    chainId={chain?.id!}
                    tokens={tokens}
                    stakingTokenInfo={stakingTokenInfo}
                    payoutTokenInfo={defaultPayoutToken}
                    stake={stakes.find((stake) => stake.tokenId === tokenIdToUpstake)!}
                    isOpen={true}
                    onClose={onUpstakeCloseHandler}
                />
            )}
            {isInProgessMerge && tokenIdToMerge && (
                <StakingMergeOverlay
                    protocolAddress={protocol}
                    chainId={chain?.id!}
                    tokens={tokens}
                    stakingTokenInfo={stakingTokenInfo}
                    payoutTokenInfo={defaultPayoutToken}
                    stake={stakes.find((stake) => stake.tokenId === tokenIdToMerge)!}
                    stakerAddress={address!}
                    isOpen={true}
                    onClose={onMergeCloseHandler}
                />
            )}
            {isInProgessAddUp && tokenIdToAddUp && (
                <StakingAddingUpOverlay
                    protocolAddress={protocol}
                    tokens={tokens}
                    chainId={chain?.id!}
                    stakingTokenInfo={stakingTokenInfo}
                    payoutTokenInfo={defaultPayoutToken}
                    stake={stakes.find((stake) => stake.tokenId === tokenIdToAddUp)!}
                    isOpen={true}
                    onClose={onAddUpCloseHandler}
                />
            )}
        </>
    )
}
