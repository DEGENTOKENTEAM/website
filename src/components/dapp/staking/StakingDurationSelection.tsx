import { durationFromSeconds } from '@dapphelpers/staking'
import clsx from 'clsx'
import { BaseSyntheticEvent, useEffect, useState } from 'react'
import { Address } from 'viem'

export type StakeBucketButton = {
    id: Address
    multiplier: number
    duration: number
    burn: boolean
    selected: boolean
    multiplierPerToken: number
}

type StakingDurationSelectionProps = {
    description?: string
    tokenSymbol: string
    durations: StakeBucketButton[]
    isCheckboxSelected: boolean
    onCheckbox: (checked: boolean) => void
    onDurationSelection: (duration: StakeBucketButton) => void
}

export const StakingDurationSelection = ({
    description,
    tokenSymbol,
    durations,
    isCheckboxSelected,
    onDurationSelection,
    onCheckbox,
}: StakingDurationSelectionProps) => {
    const isBurnBucketSelected = Boolean(
        durations?.find((duration) => duration.burn && duration.selected)
    )

    const [selectedDuration, setSelectedDuration] =
        useState<StakeBucketButton>()

    const confirmHandler = (e: BaseSyntheticEvent) => {
        onCheckbox(e.target.checked)
    }

    const itemSelectHandler = (duration: StakeBucketButton) => {
        onCheckbox(false) // always reset when new item is selected
        setSelectedDuration(duration)
    }

    useEffect(() => {
        if (!selectedDuration && durations)
            setSelectedDuration(durations.find(({ selected }) => selected))
    }, [selectedDuration, durations])

    useEffect(() => {
        if (selectedDuration) onDurationSelection(selectedDuration)
    }, [selectedDuration, onDurationSelection]) // TODO maybe change parent to 'useCallback'

    return (
        <div className="text-sm">
            <div
                className={clsx('px-1 leading-4', {
                    'mb-3': !description,
                    'mb-6': description,
                })}
            >
                Reward Multiplier & Lock Duration
                {description && (
                    <>
                        <br />
                        <span className="text-xs leading-3 text-darkTextLowEmphasis">
                            {description}
                        </span>
                    </>
                )}
            </div>

            <div
                className={clsx([
                    'grid gap-x-3 gap-y-2',
                    durations && durations.length <= 1
                        ? 'grid-cols-1'
                        : 'grid-cols-2',
                ])}
            >
                {durations && durations.length == 0 && (
                    <div className="col-span-2 rounded-lg bg-dapp-blue-800 px-5 py-2 text-sm">
                        No options available
                    </div>
                )}
                {durations &&
                    durations.length > 0 &&
                    durations.map((duration) => (
                        <button
                            key={duration.id}
                            className={clsx(
                                'flex flex-col items-center rounded-lg border border-solid bg-dapp-blue-400 p-1 leading-4',
                                {
                                    'border-dapp-blue-400': !duration.selected,
                                    'border-dapp-cyan-500':
                                        duration.selected && !duration.burn,
                                    'border-degenOrange':
                                        duration.selected && duration.burn,
                                }
                            )}
                            onClick={() => itemSelectHandler(duration)}
                        >
                            <span>Rewards x{duration.multiplier}</span>
                            <span className="text-xs">
                                {duration.burn
                                    ? `Burn ${tokenSymbol}`
                                    : duration.duration > 0
                                    ? `${durationFromSeconds(
                                          duration.duration,
                                          {
                                              long: true,
                                          }
                                      )}`
                                    : 'No lock'}
                            </span>
                        </button>
                    ))}
            </div>
            {/* if an active stake is selected, show this message as a confirmation that the user takes notice */}
            {selectedDuration && (
                <div className="mt-3 flex flex-row gap-2 px-2 text-xs">
                    <div className="flex flex-col justify-start">
                        <input
                            id="confirmation"
                            type="checkbox"
                            checked={isCheckboxSelected}
                            onChange={confirmHandler}
                            className="h-4 w-4 rounded-sm border-2 border-dapp-cyan-50 bg-transparent p-2 text-dapp-cyan-500 focus:ring-0 focus:ring-offset-0"
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <label htmlFor="confirmation">
                            {isBurnBucketSelected ? (
                                <span>
                                    I understand that my {tokenSymbol} will be
                                    burned and can NEVER be withdrawn or
                                    retreived.{' '}
                                </span>
                            ) : (
                                <span>
                                    I understand that my {tokenSymbol} will be
                                    locked for the stake duration and can not be
                                    withdrawn during this period.{' '}
                                </span>
                            )}
                        </label>
                    </div>
                </div>
            )}
        </div>
    )
}
