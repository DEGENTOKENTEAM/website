import { CaretDivider } from '@dappshared/CaretDivider'
import { BucketParams, StakeBucket, StakeBucketUpdateShareParams } from '@dapptypes'
import { Button, Description, Field, Input, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import clsx from 'clsx'
import { cloneDeep, isUndefined } from 'lodash'
import { ChangeEvent, useEffect, useState } from 'react'
import { FaRegCheckSquare, FaRegSquare, FaTimes } from 'react-icons/fa'
import { Address } from 'viem'
import { Button as DappButton } from './../../../../../Button'
import { LockUnits, LockUnitsForm } from './LockUnitsForm'

export type BucketFormParams = {
    id?: Address // immutable marker
    burn: boolean
    lock: boolean
    lockUnit: keyof typeof LockUnits
    lockPeriod: number
    initialShare: number
    share: number
}

type BucketsFormType = {
    existingBuckets?: StakeBucket[]
    editSharesOnly: boolean
    onChange?: (bucketAddParams: BucketParams[], bucketUpdateShareParams: StakeBucketUpdateShareParams[]) => void
}

const STEP = 0.5
const initialBucketData: BucketFormParams = {
    burn: false,
    lock: true,
    lockUnit: 'month',
    lockPeriod: 1,
    initialShare: 100,
    share: 100,
}

const balanceShares = (
    initialBuckets: BucketFormParams[] | null,
    buckets: BucketFormParams[],
    bucketIndex?: number
) => {
    const shareMax = 100 - (buckets.length - 1)
    const shareBlocked = buckets.reduce((acc, bucket) => acc + bucket.share, 0)
    if (!isUndefined(bucketIndex)) {
        if (initialBuckets && initialBuckets[bucketIndex] && initialBuckets[bucketIndex].burn) {
            if (initialBuckets[bucketIndex].share > buckets[bucketIndex].share) {
                buckets[bucketIndex].share = initialBuckets[bucketIndex].share
            }
        }
        if (100 - shareBlocked < 0) buckets[bucketIndex].share += 100 - shareBlocked
    }
    return buckets.map((bucket) => ({
        ...bucket,
        share:
            buckets.length === 1
                ? initialBucketData.share
                : bucket.share < 1
                ? 1
                : bucket.share > shareMax
                ? shareMax
                : bucket.share,
    }))
}

export const BucketsForm = ({ existingBuckets, onChange, editSharesOnly }: BucketsFormType) => {
    let shareReduction = initialBucketData.share
    const initialBuckets = balanceShares(null, [
        ...(editSharesOnly
            ? []
            : [{ ...initialBucketData, share: existingBuckets && existingBuckets.length > 0 ? 1 : 100 }]),
        ...(existingBuckets || []).map(({ id, duration, burn, share }) => {
            const lockUnit = Object.keys(LockUnits)
                .sort((a, b) => (LockUnits[a] > LockUnits[b] ? -1 : 1))
                .find((unit) => !(duration % LockUnits[unit])) as keyof typeof LockUnits

            let _share = share
            if (!editSharesOnly && shareReduction && !burn) {
                _share -= shareReduction
                shareReduction = 0
            }

            return {
                ...initialBucketData,
                id,
                lock: Boolean(duration),
                lockUnit,
                lockPeriod: duration / LockUnits[lockUnit],
                share: _share / 100,
                burn,
            } as BucketFormParams
        }),
    ])

    const [currentBuckets, setCurrentBuckets] = useState<BucketFormParams[]>(initialBuckets)
    const [shareBlocked, setShareBlocked] = useState(0)

    const onAddBucket = () => {
        let bucketToAdd = { ...initialBucketData, share: 1 }
        let shareReduction = bucketToAdd.share
        const updateBuckets = [...cloneDeep(currentBuckets), bucketToAdd].map((bucket) => {
            if (bucket.share > shareReduction * 2 && !bucket.burn) {
                bucket.share -= shareReduction
                shareReduction = 0
            }
            return {
                ...bucket,
            }
        })
        setCurrentBuckets(balanceShares(initialBuckets, updateBuckets))
    }

    useEffect(() => {
        if (!currentBuckets || !currentBuckets.length) return

        // trigger on change event for parent component
        onChange &&
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

        setShareBlocked(currentBuckets.reduce((acc, bucket) => acc + bucket.share, 0))
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
        setCurrentBuckets(balanceShares(initialBuckets, updateBuckets))
    }

    const onShareChange = (event: ChangeEvent<HTMLInputElement>, bucketIndex: number) => {
        const updateBuckets = cloneDeep(currentBuckets)
        if (!!event.target.value) {
            updateBuckets[bucketIndex].share = Number(event.target.value)
            setCurrentBuckets(balanceShares(initialBuckets, updateBuckets, bucketIndex))
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
                        <TabList className="flex w-full grow flex-row gap-2 rounded-lg bg-dapp-blue-800 p-[6px] leading-7 text-gray-700">
                            <Tab
                                disabled={editSharesOnly}
                                className="flex grow cursor-pointer flex-row items-center justify-center gap-1 rounded-md font-semibold text-darkTextLowEmphasis transition-all duration-300 ease-in data-[selected]:bg-dapp-blue-400 data-[selected]:text-dapp-cyan-50"
                            >
                                1. Pools & Locks
                            </Tab>
                            <Tab className="flex grow cursor-pointer flex-row items-center justify-center gap-1 rounded-md font-semibold text-darkTextLowEmphasis transition-all duration-300 ease-in data-[selected]:bg-dapp-blue-400 data-[selected]:text-dapp-cyan-50">
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
                                                                            <FaRegCheckSquare className="size-5" />
                                                                        ) : (
                                                                            <FaRegSquare className="size-5" />
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
                                                                            <FaRegCheckSquare className="size-5" />
                                                                        ) : (
                                                                            <FaRegSquare className="size-5" />
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
                                                                        <FaTimes className="size-5" />
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
                                                                disabled={currentBuckets.length == 1}
                                                                value={bucket.share || 1}
                                                                onChange={(_event) =>
                                                                    onShareChange(_event, bucketIndex)
                                                                }
                                                                placeholder="0"
                                                                className="w-full rounded-lg border-0 bg-dapp-blue-800 text-center text-sm/6 [appearance:textfield] focus:ring-0 focus:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                            />
                                                        </div>
                                                        <div className="relative w-full grow">
                                                            <div
                                                                className={clsx([
                                                                    'absolute bottom-2 right-0 z-20 h-2 rounded-full bg-success',
                                                                    shareBlocked < 100 && '!bg-yellow/60',
                                                                ])}
                                                                style={{
                                                                    width: `${Math.min(
                                                                        100,
                                                                        shareBlocked - bucket.share
                                                                    )}%`,
                                                                }}
                                                            ></div>
                                                            <input
                                                                className="[&::-webkit-slider-thumb]:size-6 z-10 h-2 w-full appearance-none rounded-full bg-dapp-blue-800 outline-none transition [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-30 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-dapp-cyan-50"
                                                                type="range"
                                                                disabled={currentBuckets.length == 1}
                                                                step={STEP}
                                                                value={bucket.share || 1}
                                                                onChange={(_event) =>
                                                                    onShareChange(_event, bucketIndex)
                                                                }
                                                                min={1}
                                                                max={100}
                                                            />
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
