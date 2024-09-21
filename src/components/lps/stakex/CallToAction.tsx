import { Button } from '@headlessui/react'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'

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
            href={`https://dgnx.finance/dapp/defitools/stakex/create?ref=0xa1276e4d73a99db98acb225f9af69b50dafb8f7b71fd10284db0ca5e6b86fe9f`}
            className={clsx([
                'w-auto cursor-pointer rounded-lg bg-dapp-cyan-500 p-4 font-title text-xl font-bold hover:bg-dapp-cyan-500/40',
                className,
            ])}
        >
            Create Protocol Now
        </Button>
    )
}
