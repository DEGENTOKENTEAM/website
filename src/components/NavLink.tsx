import Link from 'next/link'

export function NavLink({ href, children, ...props }) {
    return (
        <Link
            href={href}
            className="border-b-2 border-transparent p-1 text-light-600 hover:border-degenOrange"
            {...props}
        >
            {children}
        </Link>
    )
}
