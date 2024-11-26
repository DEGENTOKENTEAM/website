import { DAppContext, NavigationConfig } from '@dapphelpers/dapp'
import { useStakeXGetAccountInfo } from '@dapphooks/shared/useStakeXGetAccountInfo'
import { Popover, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { get, isArray } from 'lodash'
import { Fragment, useCallback, useContext, useEffect, useState } from 'react'
import { FaPiggyBank, FaTools } from 'react-icons/fa'
import { HiCurrencyDollar, HiHome } from 'react-icons/hi'
import { MdLockClock } from 'react-icons/md'
import { PiChartPieSliceLight, PiCoins, PiTimer } from 'react-icons/pi'
import { RiGovernmentFill } from 'react-icons/ri'
import { Link, useLocation } from 'react-router-dom'
import { useAccount } from 'wagmi'

const getNavigation = (config: NavigationConfig | null) => [
    {
        name: 'Dashboard',
        icon: HiHome,
        href: '',
        count: undefined,
        show: true,
        children: null,
    },
    {
        name: 'Buy $DGNX',
        icon: HiCurrencyDollar,
        href: 'https://broccoliswap.com/?inputToken=AVAX&inputChain=AVAX&outputToken=DGNX&outputChain=AVAX&amount=10',
        count: undefined,
        children: null,
        show: true,
    },
    {
        name: 'Liquidity Backing',
        icon: FaPiggyBank,
        href: 'liquidity-backing',
        count: undefined,
        show: true,
        children: null,
    },
    {
        name: 'Governance',
        icon: RiGovernmentFill,
        href: 'https://docs.dgnx.finance/degenx-ecosystem/Governance/intro_governance',
        count: undefined,
        show: true,
        children: null,
    },
    {
        name: 'Stake your $DGNX',
        icon: MdLockClock,
        href: 'staking/43114/0x00000000004545cb8440fdd6095a97debd1f3814/',
        count: undefined,
        show: true,
        children: null,
    },
    {
        name: 'DeFi Tools',
        icon: FaTools,
        href: 'defitools/stakex/',
        count: undefined,
        show: true,
        children: [
            {
                name: 'Staking Solutions',
                icon: PiCoins,
                href: 'defitools/stakex/',
                count: undefined,
                show: true,
                children: [
                    {
                        name: 'Protocols',
                        icon: PiChartPieSliceLight,
                        href: 'defitools/stakex/regulars',
                        count: undefined,
                        show: true,
                    },
                    {
                        name: 'My Protocols',
                        icon: PiChartPieSliceLight,
                        href: 'defitools/stakex/regulars/account',
                        count: undefined,
                        show: get(config, ['defitools', 'staking', 'myFlexibles', 'enabled'], false),
                    },
                    {
                        name: 'Campaigns',
                        icon: PiTimer,
                        href: 'defitools/stakex/campaigns',
                        count: undefined,
                        show: true,
                    },
                    {
                        name: 'My Campaigns',
                        icon: PiTimer,
                        href: 'defitools/stakex/campaigns/account',
                        count: undefined,
                        show: get(config, ['defitools', 'staking', 'myCampaigns', 'enabled'], false),
                    },
                ],
            },
        ],
    },
]

function MobileNavLink({ href, children, ...props }) {
    return (
        <Popover.Button as={Link} to={href} className="block w-full p-2" {...props}>
            {children}
        </Popover.Button>
    )
}

function MobileNavIcon({ open }) {
    return (
        <svg
            aria-hidden="true"
            className="size-3.5 overflow-visible stroke-slate-700 dark:stroke-slate-200"
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
        >
            <path
                d="M0 1H14M0 7H14M0 13H14"
                className={clsx('origin-center transition', open && 'scale-90 opacity-0')}
            />
            <path
                d="M2 2L12 12M12 2L2 12"
                className={clsx('origin-center transition', !open && 'scale-90 opacity-0')}
            />
        </svg>
    )
}

function MobileSidebar({ config }: { config: NavigationConfig | null }) {
    const { pathname } = useLocation()
    const isCurrent = useCallback(
        (item: any) =>
            ((item.href as string).includes('staking/') && pathname.includes('/dapp/staking')) ||
            (item.href && pathname.endsWith(item.href)) ||
            (`/dapp` === pathname && item.href === '') ||
            (`/dapp/` === pathname && item.href === ''),
        [pathname]
    )

    return (
        <Popover>
            <Popover.Button
                className="size-8 relative z-10 flex items-center justify-center [&:not(:focus-visible)]:focus:outline-none"
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
                        {getNavigation(config)
                            .filter(({ name }) => Boolean(name))
                            .filter((child) => child.show)
                            .map((item) => (
                                <Fragment key={item.name}>
                                    <MobileNavLink
                                        target={item.href?.startsWith('http') ? '_blank' : '_self'}
                                        href={item.href?.startsWith('http') ? item.href : `/dapp/${item.href}`}
                                    >
                                        <span className={clsx([isCurrent(item) && 'font-bold'])}>{item.name}</span>
                                    </MobileNavLink>
                                    {item.children &&
                                        item.children
                                            .filter((child) => child.show)
                                            .map((item) => (
                                                <Fragment key={item.name}>
                                                    <MobileNavLink
                                                        target={item.href?.startsWith('http') ? '_blank' : '_self'}
                                                        href={
                                                            item.href?.startsWith('http')
                                                                ? item.href
                                                                : `/dapp/${item.href}`
                                                        }
                                                    >
                                                        <span
                                                            className={clsx(['pl-4', isCurrent(item) && 'font-bold'])}
                                                        >
                                                            - {item.name}
                                                        </span>
                                                    </MobileNavLink>
                                                    {item.children &&
                                                        item.children
                                                            .filter((child) => child.show)
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
                                                                        <span
                                                                            className={clsx([
                                                                                'pl-8',
                                                                                isCurrent(item) && 'font-bold',
                                                                            ])}
                                                                        >
                                                                            - {item.name}
                                                                        </span>
                                                                    </MobileNavLink>
                                                                </Fragment>
                                                            ))}
                                                </Fragment>
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
                'size-6 mr-3 shrink-0 stroke-dapp-cyan-50 '
            )}
            aria-hidden="true"
        />
        <span className="flex-1">{item.name}</span>
    </Link>
)

export default function Sidebar(props: { mobile?: boolean }) {
    const { data } = useContext(DAppContext)
    const { pathname } = useLocation()
    const isCurrent = useCallback(
        (item: any) =>
            ((item.href as string).includes('staking/') && pathname.includes('/dapp/staking')) ||
            (item.href && pathname.endsWith(item.href)) ||
            (`/dapp` === pathname && item.href === '') ||
            (`/dapp/` === pathname && item.href === ''),
        [pathname]
    )

    ///
    /// account information
    ///
    const { address, isConnected } = useAccount()
    const { refetch: refetchAccountInfo, response: responseAccountInfo } = useStakeXGetAccountInfo(address!)
    const [navigationConfig, setNavigationConfig] = useState<NavigationConfig | null>(null)
    useEffect(() => {
        if (data && responseAccountInfo) {
            setNavigationConfig({
                defitools: {
                    staking: {
                        myCampaigns: { enabled: responseAccountInfo.campaigns.count > 0 },
                        myFlexibles: { enabled: responseAccountInfo.regulars.count > 0 },
                    },
                },
            })
        }
    }, [responseAccountInfo, data])

    useEffect(() => {
        if (address && isConnected) {
            setNavigationConfig(null)
            refetchAccountInfo && refetchAccountInfo()
        }
    }, [address, isConnected, refetchAccountInfo])

    if (props.mobile) return <MobileSidebar config={navigationConfig} />

    return (
        <div className="flex grow flex-col overflow-y-auto ">
            <div className="flex grow flex-col">
                <nav className="fixed flex w-64 flex-col gap-2 space-y-1 px-2" aria-label="Sidebar">
                    {getNavigation(navigationConfig)
                        .filter((item) => item.show)
                        .map((item, i) => {
                            return (
                                <Fragment key={i}>
                                    <SidebarItem item={item} current={isCurrent(item)} />
                                    {
                                        /*isCurrent(item) && */ item.children && (
                                            <div className="flex flex-col gap-2  space-y-1 border-l-2 border-l-dapp-blue-400 pl-4">
                                                {item.children
                                                    .filter((child) => child.show)
                                                    .map((child, j) => (
                                                        <Fragment key={j}>
                                                            <SidebarItem item={child} current={isCurrent(child)} />
                                                            {
                                                                /*isCurrent(child) &&*/
                                                                child.children &&
                                                                    isArray(child.children) &&
                                                                    child.children.filter(
                                                                        (grandchild) => grandchild.show
                                                                    ).length > 0 && (
                                                                        <div className="flex flex-col gap-2  space-y-1 border-l-2 border-l-dapp-blue-400 pl-4">
                                                                            {child.children
                                                                                .filter((grandchild) => grandchild.show)
                                                                                .map((grandchild, k) => (
                                                                                    <SidebarItem
                                                                                        key={k}
                                                                                        item={grandchild}
                                                                                        current={isCurrent(grandchild)}
                                                                                    />
                                                                                ))}
                                                                        </div>
                                                                    )
                                                            }
                                                        </Fragment>
                                                    ))}
                                            </div>
                                        )
                                    }
                                </Fragment>
                            )
                        })}
                </nav>
            </div>
        </div>
    )
}
