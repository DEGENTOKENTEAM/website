import Link from 'next/link'
import clsx from 'clsx'

const baseStyles = {
    solid: 'group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
    outline:
        'group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm focus:outline-none',
}

const variantStyles = {
    solid: {
        blue: 'bg-light-100 text-dark hover:bg-degenOrange border-degenOrange  dark:bg-darkblue dark:text-light-100 dark:hover:bg-activeblue transition-colors border-2 dark:border-activeblue',
        orange: 'bg-degenOrange border-2 border-degenOrange rounded-full text-black font-medium hover:bg-dark transition-colors hover:text-light-200'
    },
    outline: {
        orange: 'bg-transparent border-2 border-degenOrange rounded-full text-light-100 font-medium hover:bg-dark transition-colors',
        green: 'bg-transparent border-2 border-techGreen rounded-full text-light-100 font-medium hover:bg-dark transition-colors'
    },
}

export function Button({
    variant = 'solid',
    color = 'slate',
    className = '',
    href,
    ...props
}) {
    className = clsx(
        baseStyles[variant],
        variantStyles[variant][color],
        className
    )

    return href ? (
        <Link href={href} className={className} {...props} />
    ) : (
        <button className={className} {...props} />
    )
}
