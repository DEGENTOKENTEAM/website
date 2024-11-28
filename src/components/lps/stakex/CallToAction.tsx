import { Button } from '@headlessui/react'
import clsx from 'clsx'
import { PropsWithChildren } from 'react'

export const CallToAction = () => {
    return (
        <div className="flex w-full flex-row justify-center">
            <CallToActionButton
                href={`https://dgnx.finance/dapp/defitools/stakex/create?ref=0xa1276e4d73a99db98acb225f9af69b50dafb8f7b71fd10284db0ca5e6b86fe9f`}
            >
                Create Protocol Now
            </CallToActionButton>
        </div>
    )
}

export const CallToActionButton = ({
    className,
    href,
    children,
    variant,
    openBlank,
}: PropsWithChildren & {
    href?: string
    openBlank?: boolean
    className?: string
    variant?: 'primary' | 'secondary'
}) => {
    let v = variant ? variant : 'primary'
    let _className = clsx([
        'w-auto cursor-pointer rounded-lg p-4 font-title text-xl font-bold',
        v == 'primary' && 'bg-dapp-cyan-500 hover:bg-dapp-cyan-500/70',
        v == 'secondary' && 'bg-dapp-cyan-500/30 hover:bg-dapp-cyan-500/40',
        className,
    ])
    let props = {}
    if (openBlank || (href && !href.startsWith('#'))) props = { target: '_blank', referrerPolicy: 'no-referrer' }
    return (
        <Button as="a" href={href} className={_className} {...props}>
            {children}
        </Button>
    )
}
