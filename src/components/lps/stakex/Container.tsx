import clsx from 'clsx'
import { PropsWithChildren } from 'react'

export const OuterContainer = ({ children, className }: PropsWithChildren & { className?: string }) => {
    return <div className={clsx(['w-full', className])}>{children}</div>
}

export const InnerContainer = ({ children, className }: PropsWithChildren & { className?: string }) => {
    return <div className={clsx(['mx-auto max-w-7xl p-8', className])}>{children}</div>
}
