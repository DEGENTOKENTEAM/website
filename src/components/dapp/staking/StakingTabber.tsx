import clsx from 'clsx'
import { MdLockOutline } from 'react-icons/md'

export type StakingTabberItem = {
    headline: string
    label: string
    active: boolean
    disabled: boolean
}

const Tab = (props: { label: string; isActive: boolean; isDisabled: boolean; onClick?: () => void }) => {
    const className = clsx(
        props.isActive ? 'bg-dapp-blue-400 text-dapp-cyan-50' : 'text-darkTextLowEmphasis',
        props.isDisabled && 'opacity-70 cursor-not-allowed',
        'grow rounded-md font-semibold transition-all ease-in duration-300 cursor-pointer flex flex-row justify-center items-center gap-1'
    )
    return (
        <div className={className} onClick={props.onClick}>
            <span>{props.label}</span> {props.isDisabled ? <MdLockOutline /> : ''}
        </div>
    )
}

export const StakingTabber = (props: { tabs: StakingTabberItem[]; setActiveTab: (index: number) => void }) => {
    return (
        <div className="flex w-full grow flex-row gap-2 rounded-lg bg-dapp-blue-800 p-[6px] leading-7 text-gray-700">
            {props.tabs &&
                props.tabs?.map((tab, i) => (
                    <Tab
                        key={i}
                        label={tab.label}
                        isDisabled={tab.disabled}
                        isActive={tab.active}
                        onClick={() => !tab.disabled && props.setActiveTab(i)}
                    />
                ))}
        </div>
    )
}
