import { Button } from '@headlessui/react'
import clsx from 'clsx'
import { PropsWithChildren } from 'react'

export const CallToAction = () => {
    return (
        <div className="flex w-full flex-row justify-center">
            <CallToActionButton />
        </div>
    )
}

export const CallToActionButton = ({ className }: { className?: string }) => {
    const onClick = () => {
        location.href = '/dapp/defitools/stakex/create'
    }
    return (
        <Button
            onClick={onClick}
            className={clsx(['w-auto rounded-lg bg-dapp-cyan-500 p-4 font-title text-xl font-bold', className])}
        >
            Create Protocol Now
        </Button>
    )
}
