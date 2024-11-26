import clsx from 'clsx'

export function DappContainer({ className = '', ...props }) {
    return (
        <div
            className={clsx('mx-auto max-w-full md:px-6 lg:px-3', className)}
            {...props}
        />
    )
}
