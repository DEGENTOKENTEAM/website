import { StakeResponse } from '@dapptypes'
import { Popover, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { BsFilterLeft } from 'react-icons/bs'
import { IoCheckmark } from 'react-icons/io5'

export type SortOption = {
    label: string
    sort: 'ASC' | 'DESC'
    by: keyof StakeResponse
}

type StakingSortOptionsProps = {
    sortOptions: SortOption[]
    selectedSortOption: number
    onChangeSorting: (sortOptionIndex: number) => void
}
export const StakingSortOptions = ({ sortOptions, selectedSortOption, onChangeSorting }: StakingSortOptionsProps) => {
    return (
        <Popover className="relative">
            {({ close }) => (
                <>
                    <Popover.Button className="group inline-flex items-center rounded-md px-3 py-2 text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                        <BsFilterLeft className="size-[18px]" />
                    </Popover.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel className="absolute bottom-auto left-auto right-0 top-8 z-10 mt-1 w-auto max-w-xs">
                            <div className="overflow-hidden rounded-lg shadow-lg">
                                <div className="relative flex flex-col gap-1 whitespace-nowrap bg-dapp-blue-800 p-4">
                                    {sortOptions.map((option, optionIndex) => (
                                        <button
                                            key={optionIndex}
                                            type="button"
                                            className="flex items-center gap-2 text-left"
                                            onClick={() => {
                                                onChangeSorting(optionIndex)
                                                close()
                                            }}
                                        >
                                            {option.label} {selectedSortOption == optionIndex && <IoCheckmark />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}
