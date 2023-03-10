import Link from 'next/link'
import clsx from 'clsx'

const baseStyles = {
  solid:
    'group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
  outline:
    'group inline-flex ring-1 items-center justify-center rounded-full py-2 px-4 text-sm focus:outline-none',
}

const variantStyles = {
  solid: {
    slate:
      'bg-slate-900 dark:bg-slate-100 dark:hover:bg-slate-300 text-white dark:text-gray-900 hover:bg-slate-700 hover:text-slate-100 dark:hover:text-slate-700 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900',
    orange: 'bg-orange-600 text-white hover:text-slate-100 hover:bg-orange-500 active:bg-orange-800 active:text-orange-100 focus-visible:outline-orange-600',
    white:
      'bg-white text-slate-900 hover:bg-orange-100 active:bg-orange-200 active:text-slate-600 focus-visible:outline-white',
  },
  outline: {
    slate:
      'ring-slate-200 dark:ring-slate-200 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 dark:hover:ring-slate-100 hover:ring-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-blue-600 focus-visible:ring-slate-300',
    white:
      'ring-slate-700 text-white hover:ring-slate-500 active:ring-slate-700 active:text-slate-400 focus-visible:outline-white',
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
