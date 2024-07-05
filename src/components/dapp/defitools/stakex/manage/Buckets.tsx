import { ManageStakeXContext } from '@dapphelpers/defitools'
import { toReadableNumber } from '@dapphelpers/number'
import { durationFromSeconds } from '@dapphelpers/staking'
import { useGetMultipliersPerOneStakingToken } from '@dapphooks/staking/useGetMultipliersPerOneStakingToken'
import { useGetStakeBuckets } from '@dapphooks/staking/useGetStakeBuckets'
import { useGetStakingData } from '@dapphooks/staking/useGetStakingData'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { Tile } from '@dappshared/Tile'
import { AnnualPercentageDataType } from '@dapptypes'
import { useContext, useEffect, useState } from 'react'
import { FaPlus, FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa'
import { Button } from 'src/components/Button'
import { Spinner } from 'src/components/dapp/elements/Spinner'

export const Buckets = () => {
    const {
        data: { protocol, stakingToken, isLoading, isOwner, metrics },
    } = useContext(ManageStakeXContext)

    const [multiplierPerStakingTokens, setMultiplierPerStakingTokens] =
        useState<{ [key: string]: number }>({})

    const [yieldPerBucket, setYieldPerBucket] =
        useState<AnnualPercentageDataType>()

    const { data: dataStaking } = useGetStakingData(protocol)
    const { data: dataStakeBuckets } = useGetStakeBuckets(protocol)
    const {
        data: dataMultipliersPerOneStakingToken,
        isLoading: isLoadingMultipliersPerOneStakingToken,
    } = useGetMultipliersPerOneStakingToken(protocol)

    useEffect(() => {
        if (!dataMultipliersPerOneStakingToken) return

        setMultiplierPerStakingTokens(
            dataMultipliersPerOneStakingToken.reduce(
                (acc, multiplier) => ({
                    ...acc,
                    [multiplier.bucketId]:
                        Number(multiplier.multiplier) /
                        Number(multiplier.divider),
                }),
                {}
            )
        )
    }, [dataMultipliersPerOneStakingToken])

    useEffect(() => {
        metrics && setYieldPerBucket(metrics.annualPercentageData)
    }, [metrics])

    return (
        <Tile className="w-full">
            <div className="flex flex-row items-center">
                <span className="flex-1 font-title text-xl font-bold">
                    Staking Pools
                </span>
                {isOwner && (
                    <Button variant="primary" className="gap-3">
                        <FaPlus /> <span>Add</span>
                    </Button>
                )}
            </div>
            {isLoading ? (
                <div className="flex w-full flex-row justify-center pt-8">
                    <Spinner theme="dark" />
                </div>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                    {dataStakeBuckets &&
                        dataStakeBuckets.map((bucket) => (
                            <div
                                key={bucket.id}
                                className="flex flex-col gap-4"
                            >
                                <StatsBoxTwoColumn.Wrapper className="w-full rounded-lg bg-dapp-blue-800 px-5 py-2 text-sm">
                                    <StatsBoxTwoColumn.LeftColumn>
                                        <span className="font-bold">
                                            Lock duration
                                        </span>
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        <span className="font-bold">
                                            {bucket.burn
                                                ? `burns staked ${stakingToken?.symbol}`
                                                : bucket.duration > 0
                                                ? `${durationFromSeconds(
                                                      bucket.duration,
                                                      {
                                                          long: true,
                                                      }
                                                  )}`
                                                : 'No lock'}
                                        </span>
                                    </StatsBoxTwoColumn.RightColumn>

                                    <div className="col-span-2">
                                        <CaretDivider />
                                    </div>

                                    <StatsBoxTwoColumn.LeftColumn>
                                        Multiplier
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {bucket.multiplier}x
                                    </StatsBoxTwoColumn.RightColumn>

                                    <StatsBoxTwoColumn.LeftColumn>
                                        Multiplier per {stakingToken?.symbol}
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {isLoadingMultipliersPerOneStakingToken ? (
                                            <Spinner
                                                theme="dark"
                                                className="!h-4 !w-4"
                                            />
                                        ) : (
                                            `${
                                                multiplierPerStakingTokens
                                                    ? multiplierPerStakingTokens[
                                                          bucket.id
                                                      ]
                                                    : 0
                                            }x`
                                        )}
                                    </StatsBoxTwoColumn.RightColumn>

                                    <StatsBoxTwoColumn.LeftColumn>
                                        Reward share
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {bucket.share / 100}%
                                    </StatsBoxTwoColumn.RightColumn>

                                    <StatsBoxTwoColumn.LeftColumn>
                                        APR / APY
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {yieldPerBucket &&
                                            yieldPerBucket[bucket.id] &&
                                            `${toReadableNumber(
                                                yieldPerBucket[bucket.id].apr,
                                                0,
                                                {
                                                    maximumFractionDigits: 2,
                                                    minimumFractionDigits: 2,
                                                }
                                            )}% / ${toReadableNumber(
                                                yieldPerBucket[bucket.id].apy,
                                                0,
                                                {
                                                    maximumFractionDigits: 2,
                                                    minimumFractionDigits: 2,
                                                }
                                            )}%`}
                                    </StatsBoxTwoColumn.RightColumn>

                                    <div className="col-span-2">
                                        <CaretDivider />
                                    </div>

                                    <StatsBoxTwoColumn.LeftColumn>
                                        Staked
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {stakingToken &&
                                            toReadableNumber(
                                                bucket.staked,
                                                stakingToken?.decimals
                                            )}
                                    </StatsBoxTwoColumn.RightColumn>

                                    <StatsBoxTwoColumn.LeftColumn>
                                        Staked in %
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {dataStaking &&
                                            stakingToken &&
                                            toReadableNumber(
                                                (Number(bucket.staked) /
                                                    Number(
                                                        dataStaking.staked
                                                            .amount
                                                    )) *
                                                    100,
                                                0
                                            )}
                                        %
                                    </StatsBoxTwoColumn.RightColumn>
                                    <div className="col-span-2">
                                        <CaretDivider />
                                    </div>

                                    <StatsBoxTwoColumn.LeftColumn>
                                        Is active?
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        <div className="flex items-center justify-end">
                                            {bucket.active ? (
                                                <FaRegCheckCircle className="h-5 w-5 text-success" />
                                            ) : (
                                                <FaRegTimesCircle className="h-5 w-5 text-error" />
                                            )}
                                        </div>
                                    </StatsBoxTwoColumn.RightColumn>
                                </StatsBoxTwoColumn.Wrapper>

                                {isOwner && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="secondary">
                                            Change Share
                                        </Button>
                                        <Button
                                            variant={`${
                                                bucket.active
                                                    ? 'error'
                                                    : 'primary'
                                            }`}
                                        >
                                            Set{' '}
                                            {bucket.active
                                                ? 'Inactive'
                                                : 'Active'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            )}
        </Tile>
    )
}
