import clsx from 'clsx'
import Link from 'next/link'

const baseStyles = {
    solid: 'group inline-flex items-center justify-center rounded-full py-2 px-4  font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
    outline:
        'group inline-flex items-center justify-center rounded-full py-2 px-4  focus:outline-none',
    slick: clsx(
        'group inline-flex items-center justify-center rounded-lg py-2 px-4 focus:outline-none leading-5'
    ),
}

const variantStyles = {
    solid: {
        blue: 'bg-light-100 text-dark hover:bg-degenOrange border-degenOrange  dark:bg-darkblue dark:text-light-100 dark:hover:bg-activeblue transition-colors border-2 dark:border-activeblue',
        orange: 'bg-degenOrange border-2 border-degenOrange rounded-full text-black font-medium hover:bg-dark transition-colors hover:text-light-200',
        orangeDisabled:
            'bg-degenOrange cursor-not-allowed border-2 border-degenOrange rounded-full text-black font-medium transition-color',
        disabled:
            'bg-degenOrange cursor-not-allowed border-2 border-degenOrange rounded-full text-black font-medium transition-color opacity-50',
    },
    outline: {
        orange: 'bg-transparent border-2 border-degenOrange rounded-full text-light-100 font-medium hover:bg-dark transition-colors',
        green: 'bg-transparent border-2 border-techGreen rounded-full text-light-100 font-medium hover:bg-dark transition-colors',
    },
    slick: {
        greenBlue: clsx('bg-greenBlue disabled:opacity-70'),
        lightBlue: clsx('bg-lightBlue disabled:opacity-70'),
    },

    disabled: clsx('opacity-40'),
}

export function Button({
    variant = 'solid',
    color = 'slate',
    className = '',
    href = '',
    disabled = false,
    onClick = () => {},
    ...props
}) {
    if (variant != 'primary' && variant != 'secondary' && variant != 'error') {
        className = clsx(
            baseStyles[variant],
            variantStyles[variant][color],
            className
        )
    }

    // TODO new buttons
    const baseStyle = clsx(
        'group inline-flex items-center justify-center font-semibold rounded-lg py-2 px-4 focus:outline-none leading-5 border hover:opacity-70 disabled:opacity-40 disabled:hover:opacity-40'
    )
    if (variant == 'primary') {
        className = clsx(
            baseStyle,
            'bg-dapp-cyan-500 text-dapp-blue-800 border-dapp-cyan-500 active:border-dapp-cyan-50',
            className
        )
    }
    if (variant == 'secondary') {
        className = clsx(
            baseStyle,
            'bg-dapp-blue-100 border-dapp-blue-100 disabled:bg-dapp-blue-50 text-dapp-cyan-50 active:border-dapp-cyan-500',
            className
        )
    }
    if (variant == 'error') {
        className = clsx(
            baseStyle,
            'bg-error/80 border-error/80 disabled:bg-error/30 text-white active:border-error',
            className
        )
    }

    return href ? (
        <Link href={href} className={className} {...props} />
    ) : (
        <button
            disabled={disabled}
            onClick={onClick}
            className={className}
            {...props}
        />
    )
}
