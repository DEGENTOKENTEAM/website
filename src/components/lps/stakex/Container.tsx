import clsx from 'clsx'
import { PropsWithChildren } from 'react'

export const OuterContainer = ({
    children,
    className,
    id,
}: PropsWithChildren & { className?: string; id?: string }) => {
    return (
        <div id={id} className={clsx(['w-full', className])}>
            {children}
        </div>
    )
}

export const InnerContainer = ({
    children,
    className,
    id,
}: PropsWithChildren & { className?: string; id?: string }) => {
    return (
        <div id={id} className={clsx(['mx-auto max-w-7xl p-8', className])}>
            {children}
        </div>
    )
}
