import { toReadableNumber } from '@dapphelpers/number'
import { StakeXContext, durationFromSeconds } from '@dapphelpers/staking'
import { useGetRewardEstimationForTokens } from '@dapphooks/staking/useGetRewardEstimationForTokens'
import { useGetStakeBuckets } from '@dapphooks/staking/useGetStakeBuckets'
import { BucketStakedShare, useGetStakedSharesByStaker } from '@dapphooks/staking/useGetStakedSharesByStaker'
import { useGetTargetTokens } from '@dapphooks/staking/useGetTargetTokens'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { StakeBucket, StakeResponse, StakingBaseProps, TokenInfoResponse } from '@dapptypes'
import { Fragment, useContext, useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '../../Button'
import { Spinner } from '../elements/Spinner'
import { StakingNFTTile } from './StakingNFTTile'
import { SortOption, StakingSortOptions } from './StakingSortOptions'
import { StakingClaimOverlay } from './overlays/StakingClaimOverlay'
import { StakingRestakeOverlay } from './overlays/StakingRestakeOverlay'
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
        data: { protocol, chain },
    } = useContext(StakeXContext)

    const sortOptions: SortOption[] = useMemo(
        () => [
            {
                label: 'Most recent stake',
                by: 'tokenId',
                sort: 'DESC',
            },
            {
                label: 'Oldest stake',
                by: 'tokenId',
                sort: 'ASC',
            },
            {
                label: 'Burned stakes first',
                by: 'burned',
                sort: 'DESC',
            },
            {
                label: 'Most staked',
                by: 'amount',
                sort: 'DESC',
            },
            {
                label: 'Next unlocked stake',
                by: 'release',
                sort: 'ASC',
            },
        ],
        []
    )

    // const { address } = useAccount()
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

    const [stakesOrdered, setStakesOrdered] = useState<StakeResponse[]>()
    const [stakeShareInfo, setStakeShareInfo] = useState<
        {
            share: bigint
            staked: bigint
            divider: bigint
            duration: bigint
            burn: boolean
        }[]
    >()

    // processing / cta / interative
    const [isInProgess, setIsInProgess] = useState(false)
    const [isInProgessClaimAll, setIsInProgessClaimAll] = useState(false)
    const [isInProgessClaim, setIsInProgessClaim] = useState(false)
    const [isInProgessRestake, setIsInProgessRestake] = useState(false)
    const [isInProgessWithdraw, setIsInProgessWithdraw] = useState(false)
    const [tokenIdToClaim, setTokenIdToClaim] = useState<bigint>()
    const [tokenIdToRestake, setTokenIdToRestake] = useState<bigint>()
    const [tokenIdToWithdraw, setTokenIdToWithdraw] = useState<bigint>()

    const { refetchStakes } = useContext(StakeXContext)
    const { address } = useAccount()

    const { data: rewardEstimations, refetch: refetchRewardEstimations } = useGetRewardEstimationForTokens(
        protocol,
        chain?.id!,
        tokenIds!,
        defaultShowToken?.source
    )
    const { data: targetTokens } = useGetTargetTokens(protocol, chain?.id!)
    const { data: dataGetStakedSharesByStaker } = useGetStakedSharesByStaker(protocol, chain?.id!, address!)
    const { data: dataGetStakeBuckets } = useGetStakeBuckets(protocol, chain?.id!)

    //
    // handlers
    //

    // CLAIM ALL
    const onClaimAllHandler = () => {
        setIsInProgessClaimAll(true)
    }

    const onClaimAllCloseHandler = () => {
        refetchRewardEstimations()
        setIsInProgessClaimAll(false)
    }

    const onClaimHandler = (tokenId: bigint) => {
        setTokenIdToClaim(tokenId)
        setIsInProgessClaim(true)
    }

    const onClaimCloseHandler = () => {
        refetchRewardEstimations()
        setIsInProgessClaim(false)
    }

    const onRestakeHandler = (tokenId: bigint) => {
        setTokenIdToRestake(tokenId)
        setIsInProgessRestake(true)
    }

    const onRestakeCloseHandler = () => {
        refetchStakes()
        setIsInProgessRestake(false)
    }

    const onWithdrawHandler = (tokenId: bigint) => {
        setTokenIdToWithdraw(tokenId)
        setIsInProgessWithdraw(true)
    }

    const onWithdrawCloseHandler = () => {
        refetchStakes()
        setIsInProgessWithdraw(false)
    }

    //
    // effects
    //

    useEffect(() => {
        setIsInProgess(isInProgessClaimAll || isInProgessClaim || isInProgessRestake || isInProgessWithdraw)
    }, [isInProgessClaimAll, isInProgessClaim, isInProgessRestake, isInProgessWithdraw])

    useEffect(() => {
        dataGetStakedSharesByStaker &&
            dataGetStakeBuckets &&
            setStakeShareInfo(
                dataGetStakedSharesByStaker.map((share) => {
                    const bucketData = dataGetStakeBuckets.find((bucket) => share.bucketId == bucket.id)
                    return {
                        burn: bucketData?.burn!,
                        divider: BigInt(share.divider),
                        duration: BigInt(bucketData?.duration!),
                        share: share.share,
                        staked: share.staked,
                    }
                })
            )
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
        } else {
            setTokenIds([])
            setTotalStakedAmount(0n)
            setActiveStakeCount(0)
        }
    }, [stakes, selectedSortOption, sortOptions, isInProgess])

    useEffect(() => {
        setIsLoading(
            !Boolean(
                rewardEstimations && rewardEstimations.length && targetTokens && targetTokens.length && defaultShowToken
            )
        )
    }, [rewardEstimations, targetTokens, defaultShowToken])

    return isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4">
            <Spinner theme="dark" className="!h-10 !w-10" />
            Loading Your Stakes...
        </div>
    ) : (
        <>
            <div className="flex flex-col gap-8">
                <StatsBoxTwoColumn.Wrapper className="rounded-lg bg-dapp-blue-800 px-5 py-2 text-base">
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

                            {stakeShareInfo.map((share, i) => (
                                <Fragment key={i}>
                                    <StatsBoxTwoColumn.LeftColumn>
                                        <span className="text-darkTextLowEmphasis">
                                            {share.burn ? (
                                                <span className="font-bold text-degenOrange opacity-60">BURNED</span>
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
                                                maximumFractionDigits: 2,
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
                        {stakesOrdered &&
                            stakesOrdered.length > 0 &&
                            stakesOrdered.map((stake) => (
                                <StakingNFTTile
                                    key={'' + stake.tokenId}
                                    protocolAddress={protocol}
                                    chainId={chain?.id!}
                                    rewardAmount={toReadableNumber(
                                        tokenIdRewards[parseInt('' + stake.tokenId)],
                                        defaultShowToken?.decimals
                                    )}
                                    rewardSymbol={defaultShowToken?.symbol}
                                    stakedTokenAmount={toReadableNumber(stake.amount, stakingTokenInfo.decimals)}
                                    stakedTokenSymbol={stakingTokenInfo?.symbol}
                                    tokenId={stake.tokenId}
                                    withdrawDate={parseInt('' + stake.release)}
                                    lockStartDate={parseInt('' + stake.lockStart)}
                                    isBurned={stake.burned}
                                    canClaim={Boolean(tokenIdRewards[parseInt('' + stake.tokenId)] > 0n)}
                                    canRestake={Boolean(tokenIdRewards[parseInt('' + stake.tokenId)] > 0n)}
                                    canWithdraw={!stake.locked}
                                    onClaim={onClaimHandler}
                                    onRestake={onRestakeHandler}
                                    onWithdraw={onWithdrawHandler}
                                />
                            ))}
                    </div>
                </div>
            </div>
            {isInProgessClaimAll && (
                <StakingClaimOverlay
                    protocolAddress={protocol}
                    chainId={chain?.id!}
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
                    stakingTokenInfo={stakingTokenInfo}
                    payoutTokenInfo={defaultPayoutToken}
                    tokenId={tokenIdToWithdraw}
                    isOpen={true}
                    onClose={onWithdrawCloseHandler}
                />
            )}
        </>
    )
}
