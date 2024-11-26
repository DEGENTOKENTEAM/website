import { Switch } from '@headlessui/react'
import clsx from 'clsx'

type YesNoFormProps = {
    enabled: boolean
    onChange: (state: boolean) => void
    className?: string
}
export const SwitchForm = ({ enabled, onChange, className }: YesNoFormProps) => {
    return (
        <Switch
            checked={enabled}
            onChange={onChange}
            className={clsx(
                'group relative flex h-7 w-14 cursor-pointer rounded-full bg-dapp-blue-200/70 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[checked]:bg-success data-[focus]:outline-1 data-[focus]:outline-dapp-blue-50',
                className
            )}
        >
            <span className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-7" />
        </Switch>
    )
}
