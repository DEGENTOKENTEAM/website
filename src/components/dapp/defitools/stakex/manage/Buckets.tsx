import { ManageStakeXContext } from '@dapphelpers/defitools'
import { toReadableNumber } from '@dapphelpers/number'
import { durationFromSeconds } from '@dapphelpers/staking'
import { useBucketsEnableStakeBucket } from '@dapphooks/shared/useBucketsEnableStakeBucket'
import { useBucketsAddStakeBuckets } from '@dapphooks/staking/useBucketsAddStakeBuckets'
import { useBucketsAirdropStakers } from '@dapphooks/staking/useBucketsAirdropStakers'
import { useBucketsDeleteBucket } from '@dapphooks/staking/useBucketsDeleteBucket'
import { useBucketsGetStakeBuckets } from '@dapphooks/staking/useBucketsGetStakeBuckets'
import { useBucketsUpdateStakeBucketShares } from '@dapphooks/staking/useBucketsUpdateStakeBucketShares'
import { useGetMultipliersPerOneStakingToken } from '@dapphooks/staking/useGetMultipliersPerOneStakingToken'
import { useGetStakingData } from '@dapphooks/staking/useGetStakingData'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { Tile } from '@dappshared/Tile'
import { AnnualPercentageDataType, BucketParams, StakeBucket, StakeBucketUpdateShareParams } from '@dapptypes'
import clsx from 'clsx'
import { useCallback, useContext, useEffect, useState } from 'react'
import { FaParachuteBox, FaPen, FaPlus, FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa'
import { FaRegTrashCan } from 'react-icons/fa6'
import { Button } from 'src/components/Button'
import { Spinner } from 'src/components/dapp/elements/Spinner'
import { Address, zeroHash } from 'viem'
import { BucketsForm } from './buckets/Form'
import { AirdropStakersConfirmation } from './buckets/overlays/AirdropStakersConfirmation'
import { ApplyChangesConfirmation } from './buckets/overlays/ApplyChangesConfirmation'
import { ChangeStateConfirmation } from './buckets/overlays/ChangeStateConfirmation'
import { DeleteConfirmation } from './buckets/overlays/DeleteConfirmation'

export const Buckets = () => {
    const {
        data: { protocol, stakingToken, isLoading, metrics, chain, canEdit },
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

    ///
    /// Hooks
    ///
    const { data: dataStaking } = useGetStakingData(protocol, chain?.id!)
    const {
        data: dataStakeBuckets,
        isLoading: isLoadingStakeBuckets,
        refetch: refetchStakeBuckets,
    } = useBucketsGetStakeBuckets(protocol, chain?.id!, true)
    const { data: dataMultipliersPerOneStakingToken, isLoading: isLoadingMultipliersPerOneStakingToken } =
        useGetMultipliersPerOneStakingToken(protocol, chain?.id!, zeroHash, 0n)
    const {
        isLoading: isLoadingAddStakeBuckets,
        isSuccess: isSuccessAddStakeBuckets,
        error: errorAddStakeBuckets,
        write: writeAddStakeBuckets,
        reset: resetAddStakeBuckets,
        isPending: isPendingAddStakeBuckets,
    } = useBucketsAddStakeBuckets(
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
    } = useBucketsUpdateStakeBucketShares(
        chain?.id!,
        protocol,
        addBucketFormData?.bucketUpdateShareParams!,
        Boolean(showChangeSharesForm)
    )

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
        resetAddStakeBuckets && resetAddStakeBuckets()
        resetUpdateStakeBucketShares && resetUpdateStakeBucketShares()
        setAddBucketFormData(addBucketFormDataDraft)
        setIsApplyChangesModalOpen(true)
    }, [addBucketFormDataDraft, resetAddStakeBuckets, resetUpdateStakeBucketShares])

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
        if (addBucketFormDataDraft) {
            setHasChanges(
                addBucketFormDataDraft.bucketAddParams.reduce((acc, item) => acc + item.share, 0) +
                    addBucketFormDataDraft.bucketUpdateShareParams.reduce((acc, item) => acc + item.share, 0) ===
                    10000
            )
        }
    }, [addBucketFormDataDraft])

    /// Bucket State Toggle
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
    } = useBucketsEnableStakeBucket(chain?.id!, protocol, bucketIdToToggle!, bucketIdToToggleState)

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

    /// Aidrops
    const [isStateAirdropModalOpen, setIsStateAirdropModalOpen] = useState(false)
    const [airdropBucketId, setAirdropBucketId] = useState<Address | null>(null)
    const [airdropLimit, setAirdropLimit] = useState(50)
    const {
        isLoading: isLoadingAirdrop,
        isSuccess: isSuccessAirdrop,
        error: errorAirdrop,
        write: writeAirdrop,
        reset: resetAirdrop,
        isPending: isPendingAirdrop,
        stakesAirdropped,
    } = useBucketsAirdropStakers(protocol, chain?.id!, airdropBucketId, airdropLimit)

    const onClickAirdropStakers = (bucket: StakeBucket) => {
        resetAirdrop()
        setAirdropBucketId(bucket.id)
        setAirdropLimit(Math.min(Number(bucket.stakes), 50))
        setIsStateAirdropModalOpen(true)
    }

    const onConfirmAirdropModal = () => {
        if (airdropBucketId && writeAirdrop) writeAirdrop()
    }

    const onCancelAirdropModal = () => {
        setIsStateAirdropModalOpen(false)
    }

    const onCloseAirdropModal = () => {
        refetchStakeBuckets && refetchStakeBuckets()
        setIsStateAirdropModalOpen(false)
    }

    /// Delete Stake Bucket
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [bucketToDelete, setBucketToDelete] = useState<StakeBucket | null>(null)
    const [overtakeBucketId, setOvertakeBucketId] = useState<Address | null>(null)
    const [deleteShares, setDeleteShares] = useState<StakeBucketUpdateShareParams[] | null>(null)
    const {
        write: writeDeleteBucket,
        error: errorDeleteBucket,
        reset: resetDeleteBucket,
        isLoading: isLoadingDeleteBucket,
        isSuccess: isSuccessDeleteBucket,
        isPending: isPendingDeleteBucket,
    } = useBucketsDeleteBucket(protocol, chain?.id!, bucketToDelete?.id!, deleteShares)

    const onClickDelete = (bucket: StakeBucket) => {
        resetDeleteBucket()
        setIsDeleteModalOpen(true)
        setBucketToDelete(bucket)
    }

    const onConfirmDeleteModal = () => {
        writeDeleteBucket && writeDeleteBucket()
    }

    const onCancelDeleteModal = () => {
        setIsDeleteModalOpen(false)
        setBucketToDelete(null)
        setDeleteShares(null)
    }

    const onCloseDeleteModal = () => {
        refetchStakeBuckets && refetchStakeBuckets()
        resetDeleteBucket && resetDeleteBucket()
        setIsDeleteModalOpen(false)
        setBucketToDelete(null)
        setDeleteShares(null)
    }

    useEffect(() => {
        bucketToDelete &&
            dataStakeBuckets &&
            overtakeBucketId &&
            setDeleteShares(
                dataStakeBuckets
                    .filter((b) => b.id != bucketToDelete.id)
                    .map((b) => ({
                        id: b.id,
                        share: b.id == overtakeBucketId ? b.share + bucketToDelete.share : b.share,
                    }))
            )
    }, [bucketToDelete, dataStakeBuckets, overtakeBucketId])

    return (
        <>
            <Tile className="w-full">
                <div className="flex flex-col items-center gap-8 sm:flex-row">
                    <span className="w-full flex-1 items-start whitespace-nowrap font-title text-xl font-bold">
                        {canEdit ? `Staking Pool Management` : `Staking Pools`}
                    </span>
                    {canEdit && (
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
                                        <FaPlus /> <span>Add New Pool</span>
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
                {isLoadingStakeBuckets ? (
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
                        {canEdit && (showAddBucketsForm || showChangeSharesForm) && (
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
                            dataStakeBuckets
                                .sort((a, b) => (a.duration < b.duration ? -1 : 1))
                                .sort((a, b) => (a.burn != b.burn ? -1 : 1))
                                .map((bucket: StakeBucket) => (
                                    <div key={bucket.id} className="flex flex-col gap-4">
                                        <StatsBoxTwoColumn.Wrapper className="w-full rounded-lg bg-dapp-blue-800 px-4 py-2 text-sm">
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
                                                ) : multiplierPerStakingTokens &&
                                                  multiplierPerStakingTokens[bucket.id] ? (
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

                                            <StatsBoxTwoColumn.LeftColumn>Stakes</StatsBoxTwoColumn.LeftColumn>
                                            <StatsBoxTwoColumn.RightColumn>
                                                {Number(bucket.stakes)}
                                            </StatsBoxTwoColumn.RightColumn>

                                            <StatsBoxTwoColumn.LeftColumn>Staked</StatsBoxTwoColumn.LeftColumn>
                                            <StatsBoxTwoColumn.RightColumn>
                                                {stakingToken &&
                                                    toReadableNumber(bucket.staked, stakingToken?.decimals)}
                                            </StatsBoxTwoColumn.RightColumn>

                                            <StatsBoxTwoColumn.LeftColumn>Staked in %</StatsBoxTwoColumn.LeftColumn>
                                            <StatsBoxTwoColumn.RightColumn>
                                                {bucket.staked && dataStaking && stakingToken
                                                    ? `${toReadableNumber(
                                                          (Number(bucket.staked) / Number(dataStaking.staked.amount)) *
                                                              100,
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
                                                        <FaRegCheckCircle className="size-5 text-success" />
                                                    ) : (
                                                        <FaRegTimesCircle className="size-5 text-error" />
                                                    )}
                                                </div>
                                            </StatsBoxTwoColumn.RightColumn>
                                        </StatsBoxTwoColumn.Wrapper>
                                        {canEdit && (
                                            <div
                                                className={clsx([
                                                    'col-span-2 grid grid-cols-5 gap-4',
                                                    // bucket.staked === 0n ||
                                                    //     (bucket.staked > 0n && !bucket.active && ),
                                                ])}
                                            >
                                                <Button
                                                    variant={`${bucket.active ? 'error' : 'primary'}`}
                                                    className={clsx([!bucket.active ? 'col-span-2' : 'col-span-5'])}
                                                    disabled={
                                                        bucket.burn ||
                                                        isLoadingEnableStakeBucket ||
                                                        isPendingEnableStakeBucket
                                                    }
                                                    onClick={() => onClickToggleActiveState(bucket)}
                                                >
                                                    {bucket.active ? 'Disable' : 'Enable'}
                                                </Button>
                                                {!bucket.active && (
                                                    <>
                                                        <Button
                                                            variant="error"
                                                            disabled={
                                                                bucket.staked == 0n ||
                                                                isLoadingEnableStakeBucket ||
                                                                isPendingEnableStakeBucket
                                                            }
                                                            className="col-span-2 text-dapp-cyan-50"
                                                            onClick={() => onClickAirdropStakers(bucket)}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <FaParachuteBox /> Stakers
                                                            </span>
                                                        </Button>
                                                        <Button
                                                            variant="error"
                                                            disabled={
                                                                bucket.staked > 0n ||
                                                                bucket.burn ||
                                                                isLoadingEnableStakeBucket ||
                                                                isPendingEnableStakeBucket
                                                            }
                                                            onClick={() => onClickDelete(bucket)}
                                                        >
                                                            <FaRegTrashCan />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
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
            <AirdropStakersConfirmation
                isLoading={isLoadingAirdrop}
                isSuccess={isSuccessAirdrop}
                isPending={isPendingAirdrop}
                isOpen={isStateAirdropModalOpen}
                onClose={() => onCloseAirdropModal()}
                onConfirm={() => onConfirmAirdropModal()}
                onCancel={() => onCancelAirdropModal()}
                error={errorAirdrop}
                amountAirdrop={airdropLimit}
                amountAirdropEstimation={airdropLimit}
                amountAirdropped={Number(stakesAirdropped)}
                amountLeft={airdropLimit - Number(stakesAirdropped)}
            />
            <DeleteConfirmation
                isLoading={isLoadingDeleteBucket}
                isSuccess={isSuccessDeleteBucket}
                isPending={isPendingDeleteBucket}
                isOpen={isDeleteModalOpen}
                onClose={() => onCloseDeleteModal()}
                onConfirm={() => onConfirmDeleteModal()}
                onCancel={() => onCancelDeleteModal()}
                error={errorDeleteBucket}
                buckets={dataStakeBuckets || []}
                bucketToDelete={bucketToDelete}
                selectedBucketId={overtakeBucketId}
                onBucketSelection={setOvertakeBucketId}
            />
        </>
    )
}
