import { Popover, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { isArray } from 'lodash'
import { Fragment, useCallback } from 'react'
import { FaPiggyBank, FaTools } from 'react-icons/fa'
import { GiPayMoney } from 'react-icons/gi'
import { HiCurrencyDollar, HiHome } from 'react-icons/hi'
import { MdLockClock } from 'react-icons/md'
import { PiCoins } from 'react-icons/pi'
import { RiGovernmentFill } from 'react-icons/ri'
import { Link, useLocation } from 'react-router-dom'

const navigation = [
    {
        name: 'Dashboard',
        icon: HiHome,
        href: '',
        count: undefined,
        children: null,
    },
    {
        name: 'Buy $DGNX',
        icon: HiCurrencyDollar,
        href: 'https://broccoliswap.com/?inputToken=AVAX&inputChain=AVAX&outputToken=DGNX&outputChain=AVAX&amount=10',
        count: undefined,
        children: null,
    },
    {
        name: 'Liquidity Backing',
        icon: FaPiggyBank,
        href: 'liquidity-backing',
        count: undefined,
        children: null,
    },
    {
        name: 'Governance',
        icon: RiGovernmentFill,
        href: 'https://docs.dgnx.finance/degenx-ecosystem/Governance/intro_governance',
        count: undefined,
        children: null,
    },
    {
        name: 'Disburser',
        icon: GiPayMoney,
        href: 'disburser',
        count: undefined,
        children: null,
    },
    {
        name: 'Staking',
        icon: MdLockClock,
        href: 'staking/43114/0x00000000004545cb8440fdd6095a97debd1f3814/',
        count: undefined,
        children: null,
    },
    {
        name: 'DeFi Tools',
        icon: FaTools,
        href: 'defitools',
        count: undefined,
        children: [
            {
                name: 'STAKEX',
                icon: PiCoins,
                href: 'defitools/stakex',
                count: undefined,
                children: [],
                // children: [
                //     {
                //         name: 'Create',
                //         icon: MdLockClock,
                //         href: 'defitools/stakex/create',
                //         count: undefined,
                //         children: null,
                //     },
                //     {
                //         name: 'Manage',
                //         icon: MdLockClock,
                //         href: 'defitools/stakex/manage',
                //         count: undefined,
                //         children: null,
                //     },
                // ],
            },
        ],
    },
]

function MobileNavLink({ href, children, ...props }) {
    return (
        <Popover.Button
            as={Link}
            to={href}
            className="block w-full p-2"
            {...props}
        >
            {children}
        </Popover.Button>
    )
}

function MobileNavIcon({ open }) {
    return (
        <svg
            aria-hidden="true"
            className="h-3.5 w-3.5 overflow-visible stroke-slate-700 dark:stroke-slate-200"
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
        >
            <path
                d="M0 1H14M0 7H14M0 13H14"
                className={clsx(
                    'origin-center transition',
                    open && 'scale-90 opacity-0'
                )}
            />
            <path
                d="M2 2L12 12M12 2L2 12"
                className={clsx(
                    'origin-center transition',
                    !open && 'scale-90 opacity-0'
                )}
            />
        </svg>
    )
}

function MobileSidebar() {
    return (
        <Popover>
            <Popover.Button
                className="relative z-10 flex h-8 w-8 items-center justify-center [&:not(:focus-visible)]:focus:outline-none"
                aria-label="Toggle Navigation"
            >
                {({ open }) => <MobileNavIcon open={open} />}
            </Popover.Button>
            <Transition.Root>
                <Transition.Child
                    as={Fragment}
                    enter="duration-150 ease-out"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="duration-150 ease-in"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Popover.Overlay className="fixed inset-0 bg-slate-300/50" />
                </Transition.Child>
                <Transition.Child
                    as={Fragment}
                    enter="duration-150 ease-out"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="duration-100 ease-in"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <Popover.Panel
                        as="div"
                        className="absolute inset-x-0 top-full mt-4 flex origin-top flex-col rounded-2xl bg-white p-4 text-lg tracking-tight text-slate-900 shadow-xl ring-1 ring-slate-900/5"
                    >
                        {navigation
                            .filter(({ name, href }) => Boolean(name && href))
                            .map((item) => (
                                <Fragment key={item.name}>
                                    <MobileNavLink
                                        target={
                                            item.href?.startsWith('http')
                                                ? '_blank'
                                                : '_self'
                                        }
                                        href={
                                            item.href?.startsWith('http')
                                                ? item.href
                                                : `/dapp/${item.href}`
                                        }
                                    >
                                        {item.name}
                                    </MobileNavLink>
                                    {item.children &&
                                        item.children.map((item) => (
                                            <MobileNavLink
                                                key={item.name}
                                                target={
                                                    item.href?.startsWith(
                                                        'http'
                                                    )
                                                        ? '_blank'
                                                        : '_self'
                                                }
                                                href={
                                                    item.href?.startsWith(
                                                        'http'
                                                    )
                                                        ? item.href
                                                        : `/dapp/${item.href}`
                                                }
                                            >
                                                <span className="pl-4">
                                                    - {item.name}
                                                </span>
                                            </MobileNavLink>
                                        ))}
                                </Fragment>
                            ))}
                    </Popover.Panel>
                </Transition.Child>
            </Transition.Root>
        </Popover>
    )
}

const SidebarItem = ({ item, current }: { item: any; current: boolean }) => (
    <Link
        key={item.name}
        to={item.href.startsWith('http') ? item.href : `/dapp/${item.href}`}
        target={item.href.startsWith('http') ? '_blank' : '_self'}
        className={clsx(
            current
                ? 'bg-light-100 text-dark'
                : 'text-light-800 hover:border-degenOrange hover:bg-light-100 hover:text-dark',
            current
                ? 'dark:bg-dapp-blue-600 dark:text-dapp-cyan-50'
                : 'dark:text-dapp-cyan-50 dark:hover:border-activeblue dark:hover:bg-dapp-blue-600',
            'text-md group flex items-center rounded-lg p-2 font-bold transition-colors'
        )}
    >
        <item.icon
            className={clsx(
                current
                    ? 'text-dark dark:text-dapp-cyan-50'
                    : 'text-light-800 transition-colors group-hover:text-dark dark:text-dapp-cyan-50 dark:group-hover:text-dapp-cyan-50',
                'mr-3 h-6 w-6 flex-shrink-0 stroke-dapp-cyan-50 '
            )}
            aria-hidden="true"
        />
        <span className="flex-1">{item.name}</span>
    </Link>
)

export default function Sidebar(props: { mobile?: boolean }) {
    const location = useLocation()

    if (props.mobile) {
        return <MobileSidebar />
    }

    const isCurrent = useCallback(
        (item: any) => {
            return (
                (item.href && location.pathname.includes(item.href)) ||
                (`/dapp` === location.pathname && item.href === '') ||
                (`/dapp/` === location.pathname && item.href === '')
            )
        },
        [location]
    )

    return (
        <div className="flex flex-grow flex-col overflow-y-auto ">
            <div className="flex flex-grow flex-col">
                <nav
                    className="fixed flex w-64 flex-col gap-2 space-y-1 px-2"
                    aria-label="Sidebar"
                >
                    {navigation.map((item, i) => {
                        return (
                            <Fragment key={i}>
                                <SidebarItem
                                    item={item}
                                    current={isCurrent(item)}
                                />
                                {isCurrent(item) && item.children && (
                                    <div className="flex flex-col gap-2  space-y-1 border-l-2 border-l-dapp-blue-400 pl-4">
                                        {item.children.map((child, j) => (
                                            <Fragment key={j}>
                                                <SidebarItem
                                                    item={child}
                                                    current={isCurrent(child)}
                                                />
                                                {isCurrent(child) &&
                                                    child.children &&
                                                    isArray(child.children) &&
                                                    child.children.length >
                                                        0 && (
                                                        <div className="flex flex-col gap-2  space-y-1 border-l-2 border-l-dapp-blue-400 pl-4">
                                                            {child.children.map(
                                                                (
                                                                    grandchild,
                                                                    k
                                                                ) => (
                                                                    <SidebarItem
                                                                        key={k}
                                                                        item={
                                                                            grandchild
                                                                        }
                                                                        current={isCurrent(
                                                                            grandchild
                                                                        )}
                                                                    />
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                            </Fragment>
                                        ))}
                                    </div>
                                )}
                            </Fragment>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
