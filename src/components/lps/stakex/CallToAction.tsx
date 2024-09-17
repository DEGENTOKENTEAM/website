import { Button } from '@headlessui/react'
import clsx from 'clsx'

export const CallToAction = () => {
    return (
        <div className="flex w-full flex-row justify-center">
            <CallToActionButton />
        </div>
    )
}

export const CallToActionButton = ({ className }: { className?: string }) => {
    return (
        <Button
            as="a"
            href={`${location.protocol}//${location.host}/dapp/defitools/stakex/create?ref=0x1234`}
            className={clsx([
                'w-auto cursor-pointer rounded-lg bg-dapp-cyan-500 p-4 font-title text-xl font-bold hover:bg-dapp-cyan-500/40',
                className,
            ])}
        >
            Create Protocol Now
        </Button>
    )
}
