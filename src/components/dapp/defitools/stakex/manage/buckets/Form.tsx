import { CaretDivider } from '@dappshared/CaretDivider'
import { BucketParams, StakeBucket, StakeBucketUpdateShareParams } from '@dapptypes'
import { Button, Description, Field, Input, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import clsx from 'clsx'
import { cloneDeep } from 'lodash'
import { ChangeEvent, useEffect, useState } from 'react'
import { FaRegCheckSquare, FaRegSquare, FaTimes } from 'react-icons/fa'
import { TiLockClosed, TiLockOpen } from 'react-icons/ti'
import { Address } from 'viem'
import { Button as DappButton } from './../../../../../Button'
import { LockUnits, LockUnitsForm } from './LockUnitsForm'

const STEP = 0.5
const initialBucketData: BucketFormParams = {
    burn: false,
    lock: true,
    lockUnit: 'month',
    lockPeriod: 1,
    initialShare: 100,
    share: 0,
    shareLock: false,
    shareMax: 100,
}

const balanceShares = (buckets: BucketFormParams[], bucketIndex?: number) => {
    const bucketCount = buckets.length
    const { restShare, restShareOverall, unlockedBuckets, unlockedBucketsOverall } = buckets.reduce(
        (acc, bucket, i) => ({
            restShareOverall: acc.restShareOverall - (bucket.shareLock ? bucket.share : 0),
            unlockedBucketsOverall: acc.unlockedBucketsOverall + (bucket.shareLock ? 0 : 1),
            restShare: acc.restShare - (bucket.shareLock || bucketIndex == i ? bucket.share : 0),
            unlockedBuckets: acc.unlockedBuckets + (bucket.shareLock || bucketIndex == i ? 0 : 1),
        }),
        {
            restShare: 100,
            restShareOverall: 100,
            unlockedBuckets: 0,
            unlockedBucketsOverall: 0,
        }
    )

    let bucketShare = restShare / unlockedBuckets - ((restShare / unlockedBuckets) % STEP)

    let overlayForFirst = restShare - bucketShare * unlockedBuckets

    return buckets.map((bucket, i) => {
        let { share, shareLock } = bucket

        if (!shareLock && bucketIndex != i) {
            share = bucketShare + overlayForFirst
            overlayForFirst = 0
        }

        return {
            ...bucket,
            ...(bucketCount === 1
                ? {
                      // reset shares when only on items is available
                      shareLock: initialBucketData.shareLock,
                      share: initialBucketData.share,
                      shareMax: initialBucketData.shareMax,
                  }
                : {
                      shareLock: bucketCount == 1 ? false : bucket.shareLock,
                      share,
                      shareMax:
                          !bucket.shareLock && unlockedBucketsOverall >= 2
                              ? restShareOverall - (unlockedBucketsOverall - 1)
                              : bucket.shareMax,
                  }),
        }
    })
}

export type BucketFormParams = {
    id?: Address // immutable marker
    burn: boolean
    lock: boolean
    lockUnit: keyof typeof LockUnits
    lockPeriod: number
    initialShare: number
    share: number
    shareLock: boolean
    shareMax: number
}

type BucketsFormType = {
    existingBuckets?: StakeBucket[]
    editSharesOnly: boolean
    onChange?: (bucketAddParams: BucketParams[], bucketUpdateShareParams: StakeBucketUpdateShareParams[]) => void
}

export const BucketsForm = ({ existingBuckets, onChange, editSharesOnly }: BucketsFormType) => {
    const [currentBuckets, setCurrentBuckets] = useState<BucketFormParams[]>(
        balanceShares([
            ...(editSharesOnly ? [] : [initialBucketData]),
            ...(existingBuckets || []).map(({ id, duration, burn, share }) => {
                const lockUnit = Object.keys(LockUnits)
                    .sort((a, b) => (LockUnits[a] > LockUnits[b] ? -1 : 1))
                    .find((unit) => !(duration % LockUnits[unit])) as keyof typeof LockUnits
                return {
                    ...initialBucketData,
                    id,
                    lock: Boolean(duration),
                    lockUnit,
                    lockPeriod: duration / LockUnits[lockUnit],
                    share: (editSharesOnly ? share : 0) / 100,
                    shareLock: editSharesOnly,
                    burn,
                } as BucketFormParams
            }),
        ])
    )

    const [shareLocksEnabled, setShareLocksEnabled] = useState(true)

    const onAddBucket = () => {
        const updateBuckets = [...cloneDeep(currentBuckets), initialBucketData].map((bucket) => ({
            ...bucket,
            shareLock: false,
        }))
        setCurrentBuckets(balanceShares(updateBuckets))
    }

    useEffect(() => {
        if (!onChange || !currentBuckets || !currentBuckets.length) return

        const unlockedShares = currentBuckets.filter((bucket) => !bucket.shareLock).length

        setShareLocksEnabled(
            unlockedShares > 1 &&
                100 - currentBuckets.reduce((acc, bucket) => (bucket.shareLock ? acc + bucket.share : acc), 0) >
                    unlockedShares
        )

        // trigger on change event for parent component
        onChange(
            currentBuckets
                .filter((b) => !b.id)
                .map((bucket) => ({
                    burn: bucket.burn,
                    lock: bucket.lock && !bucket.burn ? bucket.lockPeriod * LockUnits[bucket.lockUnit] : 0,
                    share: bucket.share * 100,
                })),
            currentBuckets.filter((b) => b.id).map(({ id, share }) => ({ id: id!, share: share * 100 }))
        )
    }, [currentBuckets, onChange])

    const onChangeLockUnit = (bucketIndex: number, lockUnit: keyof typeof LockUnits) => {
        const updateBuckets = cloneDeep(currentBuckets)
        updateBuckets[bucketIndex].lockUnit = lockUnit
        setCurrentBuckets(updateBuckets)
    }

    const onChangeLockPeriod = (_event: ChangeEvent<HTMLInputElement>, bucketIndex: number) => {
        const updateBuckets = cloneDeep(currentBuckets)
        updateBuckets[bucketIndex].lockPeriod = Number(_event.target.value)
        setCurrentBuckets(updateBuckets)
    }

    const onRemoveBucket = (bucketIndex: number) => {
        const updateBuckets = cloneDeep(currentBuckets)
        if (currentBuckets.length === 1) return
        updateBuckets.splice(bucketIndex, 1)
        setCurrentBuckets(balanceShares(updateBuckets))
    }

    const onShareLockClick = (bucketIndex: number) => {
        const updateBuckets = cloneDeep(currentBuckets)
        updateBuckets[bucketIndex].shareLock = !updateBuckets[bucketIndex].shareLock
        setCurrentBuckets(balanceShares(updateBuckets, bucketIndex))
    }

    const onShareChange = (event: ChangeEvent<HTMLInputElement>, bucketIndex: number) => {
        const updateBuckets = cloneDeep(currentBuckets)
        if (!!event.target.value && Number(event.target.value) <= updateBuckets[bucketIndex].shareMax) {
            updateBuckets[bucketIndex].share = Number(event.target.value)
            setCurrentBuckets(balanceShares(updateBuckets, bucketIndex))
        }
    }

    const toggleLockStake = (bucketIndex: number) => {
        const updateBuckets = cloneDeep(currentBuckets)

        if (!updateBuckets[bucketIndex].lock && updateBuckets[bucketIndex].burn) updateBuckets[bucketIndex].burn = false

        updateBuckets[bucketIndex].lock = !updateBuckets[bucketIndex].lock
        setCurrentBuckets(updateBuckets)
    }

    const toggleBurnStake = (bucketIndex: number) => {
        const updateBuckets = cloneDeep(currentBuckets)

        if (!updateBuckets[bucketIndex].burn && updateBuckets[bucketIndex].lock) updateBuckets[bucketIndex].lock = false

        updateBuckets[bucketIndex].burn = !updateBuckets[bucketIndex].burn
        setCurrentBuckets(updateBuckets)
    }

    return (
        <div className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4 rounded-lg bg-dapp-blue-400 p-3">
                <div className="flex items-center justify-between text-lg font-bold">
                    {Boolean(editSharesOnly) ? <span>Change Pool Shares</span> : <span>Add Pools</span>}
                </div>
                <div>
                    <TabGroup defaultIndex={editSharesOnly ? 1 : 0}>
                        <TabList className="full-w flex flex-grow flex-row gap-2 rounded-lg bg-dapp-blue-800 p-[6px] leading-7 text-gray-700">
                            <Tab
                                disabled={editSharesOnly}
                                className="flex flex-grow cursor-pointer flex-row items-center justify-center gap-1 rounded-md font-semibold text-darkTextLowEmphasis transition-all duration-300 ease-in data-[selected]:bg-dapp-blue-400 data-[selected]:text-dapp-cyan-50"
                            >
                                1. Pools & Locks
                            </Tab>
                            <Tab className="flex flex-grow cursor-pointer flex-row items-center justify-center gap-1 rounded-md font-semibold text-darkTextLowEmphasis transition-all duration-300 ease-in data-[selected]:bg-dapp-blue-400 data-[selected]:text-dapp-cyan-50">
                                2. Pool Shares %
                            </Tab>
                        </TabList>
                        <TabPanels className="mt-2">
                            <TabPanel>
                                <div className="flex flex-col gap-2">
                                    {currentBuckets.length &&
                                        currentBuckets.map(
                                            (bucket, bucketIndex) =>
                                                !bucket.id && (
                                                    <div className="flex flex-col gap-2 pt-2" key={bucketIndex}>
                                                        {bucketIndex > 0 && <CaretDivider />}
                                                        <Field className="flex flex-col gap-2">
                                                            {bucketIndex === 0 && (
                                                                <Description className="px-2 text-xs/4 text-dapp-cyan-50/50">
                                                                    You can choose between a lock period in which the
                                                                    stakers stake is being locked, or a a burn mechanism
                                                                    in which the stakers stake will get burned on
                                                                    depositing his stake or no locking period at all
                                                                </Description>
                                                            )}
                                                            <div className="mt-2 flex flex-col gap-2">
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        className={clsx([
                                                                            'flex w-full items-center justify-center gap-2 rounded-lg border-0 border-dapp-blue-200 bg-dapp-blue-800 px-4 text-center text-sm/10 focus:ring-0 focus:ring-offset-0',
                                                                        ])}
                                                                        onClick={() => {
                                                                            toggleLockStake(bucketIndex)
                                                                        }}
                                                                    >
                                                                        Lock Stake{' '}
                                                                        {bucket.lock ? (
                                                                            <FaRegCheckSquare className="h-5 w-5" />
                                                                        ) : (
                                                                            <FaRegSquare className="h-5 w-5" />
                                                                        )}
                                                                    </Button>
                                                                    <Button
                                                                        className={clsx([
                                                                            'flex w-full items-center justify-center gap-1 rounded-lg border-0 border-dapp-blue-200 bg-dapp-blue-800 px-4 text-center text-sm/10 focus:ring-0 focus:ring-offset-0 md:gap-2',
                                                                        ])}
                                                                        onClick={() => {
                                                                            toggleBurnStake(bucketIndex)
                                                                        }}
                                                                    >
                                                                        Burn Stake
                                                                        {bucket.burn ? (
                                                                            <FaRegCheckSquare className="h-5 w-5" />
                                                                        ) : (
                                                                            <FaRegSquare className="h-5 w-5" />
                                                                        )}
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        disabled={
                                                                            currentBuckets.filter((b) => !b.id)
                                                                                .length === 1
                                                                        }
                                                                        className="flex w-auto items-center justify-center gap-2 rounded-lg border-0 border-dapp-blue-200 bg-error/60 px-4 text-center text-sm/10 focus:ring-0 focus:ring-offset-0 disabled:opacity-30"
                                                                        onClick={() => onRemoveBucket(bucketIndex)}
                                                                    >
                                                                        <FaTimes className="h-5 w-5" />
                                                                    </Button>
                                                                </div>
                                                                <LockUnitsForm
                                                                    disabled={bucket.burn || !bucket.lock}
                                                                    onChangeLockPeriod={onChangeLockPeriod}
                                                                    onChangeLockUnit={onChangeLockUnit}
                                                                    bucket={bucket}
                                                                    bucketIndex={bucketIndex}
                                                                />
                                                            </div>
                                                        </Field>
                                                    </div>
                                                )
                                        )}
                                    <DappButton variant="primary" onClick={() => onAddBucket()} className="mt-4">
                                        Add Another Pool
                                    </DappButton>
                                </div>
                            </TabPanel>
                            <TabPanel>
                                <div className="flex flex-col gap-2">
                                    {currentBuckets.length &&
                                        [
                                            ...currentBuckets
                                                .map((bucket, bucketIndex) => ({
                                                    bucket,
                                                    bucketIndex,
                                                }))
                                                .filter(({ bucket }) => !Boolean(bucket.id)),
                                            ...currentBuckets
                                                .map((bucket, bucketIndex) => ({
                                                    bucket,
                                                    bucketIndex,
                                                }))
                                                .filter(({ bucket }) => Boolean(bucket.id)),
                                        ].map(({ bucket, bucketIndex }, idx) => (
                                            <div className="pt-2" key={idx}>
                                                <Field className="flex flex-col gap-2">
                                                    {idx === 0 && (
                                                        <Description className="px-2 text-xs/4 text-dapp-cyan-50/50">
                                                            {/* If you are about to
                                                            add more than one
                                                            staking pool, you
                                                            need to split the
                                                            share between these
                                                            pools.  */}
                                                            The configured shares will always be balanced between all
                                                            pools while you&apos;re setting them up. Until you lock
                                                            them. If you add a new pool after setting up the shares, the
                                                            shares will be reset and balanced. Two pools don&apos;t need
                                                            a lock.
                                                        </Description>
                                                    )}
                                                    {idx > 0 && <CaretDivider />}
                                                    <div className="mx-1 flex gap-2 text-xs">
                                                        <span className="font-bold">Pools & Locks:</span>
                                                        {bucket.burn && <span>Burn Stake</span>}
                                                        {!bucket.burn &&
                                                            (bucket.lock ? (
                                                                <span>{`${bucket.lockPeriod} ${bucket.lockUnit}(s) lock`}</span>
                                                            ) : (
                                                                <span>No Lock</span>
                                                            ))}
                                                    </div>
                                                    <div className="flex w-full items-center gap-4">
                                                        <div className="w-24">
                                                            <Input
                                                                type="number"
                                                                disabled={
                                                                    !shareLocksEnabled ||
                                                                    bucket.shareLock ||
                                                                    currentBuckets.length == 1
                                                                }
                                                                value={bucket.share || bucket.initialShare || 1}
                                                                onChange={(_event) =>
                                                                    onShareChange(_event, bucketIndex)
                                                                }
                                                                placeholder="0"
                                                                className="w-full rounded-lg border-0 bg-dapp-blue-800 text-center text-sm/6 [appearance:textfield] focus:ring-0 focus:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                            />
                                                        </div>
                                                        <div className="flex-grow-1 w-full">
                                                            <input
                                                                className="h-2 w-full appearance-none rounded-full bg-dapp-blue-800 outline-none transition [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-dapp-cyan-50"
                                                                type="range"
                                                                disabled={
                                                                    !shareLocksEnabled ||
                                                                    bucket.shareLock ||
                                                                    currentBuckets.length == 1
                                                                }
                                                                step={STEP}
                                                                value={bucket.share || bucket.initialShare || 1}
                                                                onChange={(_event) =>
                                                                    onShareChange(_event, bucketIndex)
                                                                }
                                                                min={1}
                                                                max={bucket.shareMax}
                                                            />
                                                        </div>
                                                        <div>
                                                            <button
                                                                disabled={
                                                                    (!shareLocksEnabled && !bucket.shareLock) ||
                                                                    currentBuckets.length == 1
                                                                }
                                                                onClick={() => onShareLockClick(bucketIndex)}
                                                                className={clsx([
                                                                    'w-full rounded-lg border-0 border-dapp-blue-200 bg-dapp-blue-800 px-3 py-2 text-center text-2xl focus:ring-0 focus:ring-offset-0',
                                                                    bucket.shareLock && '!bg-dapp-blue-100',
                                                                ])}
                                                            >
                                                                {bucket.shareLock ? <TiLockClosed /> : <TiLockOpen />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Field>
                                            </div>
                                        ))}
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </div>
            </div>
        </div>
    )
}
