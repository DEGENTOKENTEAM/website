import { ManageStakeXContext } from '@dapphelpers/defitools'
import { toReadableNumber } from '@dapphelpers/number'
import { durationFromSeconds } from '@dapphelpers/staking'
import { useEnableStakeBucket } from '@dapphooks/shared/useEnableStakeBucket'
import { useAddStakeBuckets } from '@dapphooks/staking/useAddStakeBuckets'
import { useGetMultipliersPerOneStakingToken } from '@dapphooks/staking/useGetMultipliersPerOneStakingToken'
import { useGetStakeBuckets } from '@dapphooks/staking/useGetStakeBuckets'
import { useGetStakingData } from '@dapphooks/staking/useGetStakingData'
import { useUpdateStakeBucketShares } from '@dapphooks/staking/useUpdateStakeBucketShares'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { Tile } from '@dappshared/Tile'
import { AnnualPercentageDataType, BucketParams, StakeBucket, StakeBucketUpdateShareParams } from '@dapptypes'
import clsx from 'clsx'
import { useCallback, useContext, useEffect, useState } from 'react'
import { FaPen, FaPlus, FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa'
import { Button } from 'src/components/Button'
import { Spinner } from 'src/components/dapp/elements/Spinner'
import { Address } from 'viem'
import { BucketsForm } from './buckets/Form'
import { ApplyChangesConfirmation } from './buckets/overlays/ApplyChangesConfirmation'
import { ChangeStateConfirmation } from './buckets/overlays/ChangeStateConfirmation'

export const Buckets = () => {
    const {
        data: { protocol, stakingToken, isLoading, isOwner, metrics, chain },
    } = useContext(ManageStakeXContext)

    const [multiplierPerStakingTokens, setMultiplierPerStakingTokens] = useState<{ [key: string]: number }>({})
    const [yieldPerBucket, setYieldPerBucket] = useState<AnnualPercentageDataType>()
    const [showAddBucketsForm, setShowAddBucketsForm] = useState(false)
    const [showChangeSharesForm, setShowChangeSharesForm] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [addBucketFormData, setAddBucketFormData] = useState<{
        bucketAddParams: BucketParams[]
        bucketUpdateShareParams: StakeBucketUpdateShareParams[]
    }>()
    const [addBucketFormDataDraft, setAddBucketFormDataDraft] = useState<{
        bucketAddParams: BucketParams[]
        bucketUpdateShareParams: StakeBucketUpdateShareParams[]
    }>()
    const [isApplyChangesModalOpen, setIsApplyChangesModalOpen] = useState(false)

    const { data: dataStaking } = useGetStakingData(protocol, chain?.id!)
    const { data: dataStakeBuckets, refetch: refetchStakeBuckets } = useGetStakeBuckets(protocol, chain?.id!, true)
    const { data: dataMultipliersPerOneStakingToken, isLoading: isLoadingMultipliersPerOneStakingToken } =
        useGetMultipliersPerOneStakingToken(protocol, chain?.id!)
    const {
        isLoading: isLoadingAddStakeBuckets,
        isSuccess: isSuccessAddStakeBuckets,
        error: errorAddStakeBuckets,
        write: writeAddStakeBuckets,
        reset: resetAddStakeBuckets,
        isPending: isPendingAddStakeBuckets,
    } = useAddStakeBuckets(
        chain?.id!,
        protocol,
        addBucketFormData?.bucketAddParams!,
        addBucketFormData?.bucketUpdateShareParams!
    )
    const {
        isLoading: isLoadingUpdateStakeBucketShares,
        isSuccess: isSuccessUpdateStakeBucketShares,
        error: errorUpdateStakeBucketShares,
        write: writeUpdateStakeBucketShares,
        reset: resetUpdateStakeBucketShares,
        isPending: isPendingUpdateStakeBucketShares,
    } = useUpdateStakeBucketShares(chain?.id!, protocol, addBucketFormData?.bucketUpdateShareParams!)

    const onClickAddButton = () => {
        resetAddStakeBuckets()
        resetUpdateStakeBucketShares()
        setShowAddBucketsForm(true)
    }
    const onClickChangeSharesButton = () => {
        resetAddStakeBuckets()
        resetUpdateStakeBucketShares()
        setShowChangeSharesForm(true)
    }
    const onClickCancelButton = () => {
        setShowAddBucketsForm(false)
        setShowChangeSharesForm(false)
    }
    const onClickSaveButton = useCallback(() => {
        setAddBucketFormData(addBucketFormDataDraft)
        setIsApplyChangesModalOpen(true)
    }, [addBucketFormDataDraft])

    const onConfirmationModalOK = useCallback(() => {
        if (addBucketFormData && addBucketFormData?.bucketAddParams && addBucketFormData?.bucketAddParams.length > 0) {
            writeAddStakeBuckets && writeAddStakeBuckets()
        } else {
            writeUpdateStakeBucketShares && writeUpdateStakeBucketShares()
        }
    }, [writeAddStakeBuckets, writeUpdateStakeBucketShares, addBucketFormData])

    const onConfirmationModalNOK = () => {
        setIsApplyChangesModalOpen(false)
    }

    const onConfirmationModalClose = () => {
        refetchStakeBuckets && refetchStakeBuckets()
        setShowAddBucketsForm(false)
        setShowChangeSharesForm(false)
        setIsApplyChangesModalOpen(false)
    }

    useEffect(() => {
        if (!dataMultipliersPerOneStakingToken) return

        setMultiplierPerStakingTokens(
            dataMultipliersPerOneStakingToken.reduce(
                (acc, multiplier) => ({
                    ...acc,
                    [multiplier.bucketId]: Number(multiplier.multiplier) / Number(multiplier.divider),
                }),
                {}
            )
        )
    }, [dataMultipliersPerOneStakingToken])

    useEffect(() => {
        metrics && setYieldPerBucket(metrics.annualPercentageData)
    }, [metrics])

    useEffect(() => {
        addBucketFormDataDraft && setHasChanges(true)
    }, [addBucketFormDataDraft])

    //
    // bucket state toggle
    //
    const [isStateToggleModalOpen, setIsStateToggleModalOpen] = useState(false)
    const [bucketIdToToggle, setBucketIdToToggle] = useState<Address | null>(null)
    const [bucketIdToToggleState, setBucketIdToToggleState] = useState(false)

    const {
        isLoading: isLoadingEnableStakeBucket,
        isSuccess: isSuccessEnableStakeBucket,
        error: errorEnableStakeBucket,
        write: writeEnableStakeBucket,
        reset: resetEnableStakeBucket,
        isPending: isPendingEnableStakeBucket,
    } = useEnableStakeBucket(chain?.id!, protocol, bucketIdToToggle!, bucketIdToToggleState)

    const onClickToggleActiveState = (bucket: StakeBucket) => {
        resetEnableStakeBucket()
        setBucketIdToToggle(bucket.id)
        setBucketIdToToggleState(!bucket.active)
        setIsStateToggleModalOpen(true)
    }

    const onConfirmStateToggleModal = () => {
        if (bucketIdToToggle && writeEnableStakeBucket) writeEnableStakeBucket()
    }

    const onCancelStateToggleModal = () => {
        setBucketIdToToggle(null)
        setBucketIdToToggleState(false)
        setIsStateToggleModalOpen(false)
    }

    const onCloseStateToggleModal = () => {
        refetchStakeBuckets && refetchStakeBuckets()
        setBucketIdToToggle(null)
        setBucketIdToToggleState(false)
        setIsStateToggleModalOpen(false)
    }

    return (
        <>
            <Tile className="w-full">
                <div className="flex flex-col items-center gap-8 sm:flex-row">
                    <span className="w-full flex-1 items-start whitespace-nowrap font-title text-xl font-bold">
                        {isOwner ? `Staking Pool Management` : `Staking Pools`}
                    </span>
                    {isOwner && (
                        <>
                            {(showAddBucketsForm || showChangeSharesForm) && (
                                <div className="flex w-full justify-end gap-2">
                                    <Button disabled={!hasChanges} onClick={onClickSaveButton} variant="primary">
                                        <span>Apply Changes</span>
                                    </Button>
                                    <Button onClick={onClickCancelButton} variant="secondary">
                                        <span>Cancel</span>
                                    </Button>
                                </div>
                            )}

                            {!showAddBucketsForm && !showChangeSharesForm && (
                                <div className="flex w-full justify-end gap-2">
                                    <Button onClick={onClickAddButton} variant="primary" className="gap-3">
                                        <FaPlus /> <span>Add</span>
                                    </Button>
                                    {dataStakeBuckets && dataStakeBuckets.length > 1 && (
                                        <Button onClick={onClickChangeSharesButton} variant="primary" className="gap-3">
                                            <FaPen /> <span>Change Shares</span>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
                {isLoading ? (
                    <div className="flex w-full flex-row justify-center pt-8">
                        <Spinner theme="dark" />
                    </div>
                ) : (
                    <div
                        className={clsx([
                            'mt-8 grid grid-cols-1 gap-8',
                            dataStakeBuckets && dataStakeBuckets.length > 1 && 'md:grid-cols-2',
                        ])}
                    >
                        {isOwner && (showAddBucketsForm || showChangeSharesForm) && (
                            <div className={clsx(dataStakeBuckets && dataStakeBuckets.length > 1 && 'md:col-span-2')}>
                                <BucketsForm
                                    editSharesOnly={Boolean(showChangeSharesForm)}
                                    onChange={(bucketAddParams, bucketUpdateShareParams) => {
                                        setAddBucketFormDataDraft({
                                            bucketAddParams,
                                            bucketUpdateShareParams,
                                        })
                                    }}
                                    existingBuckets={dataStakeBuckets || []}
                                />
                            </div>
                        )}
                        {dataStakeBuckets &&
                            dataStakeBuckets.map((bucket: StakeBucket) => (
                                <div key={bucket.id} className="flex flex-col gap-4">
                                    <StatsBoxTwoColumn.Wrapper className="w-full rounded-lg bg-dapp-blue-800 px-5 py-2 text-sm">
                                        <StatsBoxTwoColumn.LeftColumn>
                                            <span className="font-bold">Lock duration</span>
                                        </StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            <span className="font-bold">
                                                {bucket.burn
                                                    ? `burns ${stakingToken?.symbol}`
                                                    : bucket.duration > 0
                                                    ? `${durationFromSeconds(bucket.duration, {
                                                          long: true,
                                                      })}`
                                                    : 'No lock'}
                                            </span>
                                        </StatsBoxTwoColumn.RightColumn>

                                        <div className="col-span-2">
                                            <CaretDivider />
                                        </div>

                                        <StatsBoxTwoColumn.LeftColumn>Multiplier</StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {bucket.multiplier}x
                                        </StatsBoxTwoColumn.RightColumn>

                                        <StatsBoxTwoColumn.LeftColumn>
                                            Multiplier per {stakingToken?.symbol}
                                        </StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {isLoadingMultipliersPerOneStakingToken ? (
                                                <Spinner theme="dark" className="!h-4 !w-4" />
                                            ) : multiplierPerStakingTokens && multiplierPerStakingTokens[bucket.id] ? (
                                                `${multiplierPerStakingTokens[bucket.id]}x`
                                            ) : (
                                                'n/a'
                                            )}
                                        </StatsBoxTwoColumn.RightColumn>

                                        <StatsBoxTwoColumn.LeftColumn>Reward share</StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {bucket.share / 100}%
                                        </StatsBoxTwoColumn.RightColumn>

                                        <StatsBoxTwoColumn.LeftColumn>APR / APY</StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {yieldPerBucket && yieldPerBucket[bucket.id]
                                                ? `${toReadableNumber(yieldPerBucket[bucket.id].apr, 0, {
                                                      maximumFractionDigits: 2,
                                                      minimumFractionDigits: 2,
                                                  })}% / ${toReadableNumber(yieldPerBucket[bucket.id].apy, 0, {
                                                      maximumFractionDigits: 2,
                                                      minimumFractionDigits: 2,
                                                  })}%`
                                                : '0% / 0%'}
                                        </StatsBoxTwoColumn.RightColumn>

                                        <div className="col-span-2">
                                            <CaretDivider />
                                        </div>

                                        <StatsBoxTwoColumn.LeftColumn>Staked</StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {stakingToken && toReadableNumber(bucket.staked, stakingToken?.decimals)}
                                        </StatsBoxTwoColumn.RightColumn>

                                        <StatsBoxTwoColumn.LeftColumn>Staked in %</StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {bucket.staked && dataStaking && stakingToken
                                                ? `${toReadableNumber(
                                                      (Number(bucket.staked) / Number(dataStaking.staked.amount)) * 100,
                                                      0
                                                  )}%`
                                                : 'n/a'}
                                        </StatsBoxTwoColumn.RightColumn>
                                        <div className="col-span-2">
                                            <CaretDivider />
                                        </div>

                                        <StatsBoxTwoColumn.LeftColumn>Is active?</StatsBoxTwoColumn.LeftColumn>
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

                                    {isOwner && dataStakeBuckets.length > 1 && (
                                        <Button
                                            variant={`${bucket.active ? 'error' : 'primary'}`}
                                            className="col-span-2"
                                            disabled={isLoadingEnableStakeBucket || isPendingEnableStakeBucket}
                                            onClick={() => onClickToggleActiveState(bucket)}
                                        >
                                            Set {bucket.active ? 'Inactive' : 'Active'}
                                        </Button>
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </Tile>
            <ApplyChangesConfirmation
                isLoading={Boolean(isLoadingAddStakeBuckets) || Boolean(isLoadingUpdateStakeBucketShares)}
                isSuccess={Boolean(isSuccessAddStakeBuckets) || Boolean(isSuccessUpdateStakeBucketShares)}
                isPending={Boolean(isPendingAddStakeBuckets) || Boolean(isPendingUpdateStakeBucketShares)}
                isOpen={isApplyChangesModalOpen}
                onClose={() => onConfirmationModalClose()}
                onConfirm={() => onConfirmationModalOK()}
                onCancel={() => onConfirmationModalNOK()}
                error={errorAddStakeBuckets || errorUpdateStakeBucketShares}
            />
            <ChangeStateConfirmation
                isLoading={isLoadingEnableStakeBucket}
                isSuccess={isSuccessEnableStakeBucket}
                isPending={isPendingEnableStakeBucket}
                isOpen={isStateToggleModalOpen}
                onClose={() => onCloseStateToggleModal()}
                onConfirm={() => onConfirmStateToggleModal()}
                onCancel={() => onCancelStateToggleModal()}
                error={errorEnableStakeBucket}
                enabled={bucketIdToToggleState}
            />
        </>
    )
}
