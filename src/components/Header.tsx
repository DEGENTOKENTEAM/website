import { Popover, Transition } from '@headlessui/react'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'
import { BsArrowUpRight } from 'react-icons/bs'
import { FaDiscord, FaTelegramPlane } from 'react-icons/fa'
import { SiLinktree } from 'react-icons/si'

import { Button } from './Button'
import { Container } from './Container'
import { NavLink } from './NavLink'

import logoImage from '../images/logo_large.png'
import { DarkmodeToggle } from './DarkmodeToggle'

import translations from '../translations/site.json'

function MobileNavLink({ href, children, ...props }) {
    return (
        <Popover.Button as={Link} href={href} className="block w-full p-2" {...props}>
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

function MobileNavigation() {
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
                        <MobileNavLink href="#holder">$DGNX</MobileNavLink>
                        <MobileNavLink href="#ecosystem">Ecosystem</MobileNavLink>
                        <MobileNavLink href="#roadmap">Roadmap</MobileNavLink>
                        <MobileNavLink href="#join">Social</MobileNavLink>
                        <MobileNavLink href="#team">Team</MobileNavLink>
                        <hr className="m-2 border-slate-300/40" />
                        <MobileNavLink
                            href="https://broccoliswap.com/?inputToken=AVAX&inputChain=AVAX&outputToken=DGNX&outputChain=AVAX&amount=10"
                            target="_blank"
                        >
                            {translations.header.buy.en}
                        </MobileNavLink>
                    </Popover.Panel>
                </Transition.Child>
            </Transition.Root>
        </Popover>
    )
}

export function Header() {
    return (
        <header className="py-2 sm:py-5">
            <Container>
                <nav className="relative z-50 flex items-center justify-between gap-y-3">
                    <div className="flex items-center lg:gap-x-12">
                        <Link href="#" aria-label="Home">
                            <Image src={logoImage} alt="" height={48} />
                        </Link>
                        <div className="hidden lg:flex lg:gap-x-1 xl:gap-x-5">
                            <NavLink href="#holder">$DGNX</NavLink>
                            <NavLink href="#ecosystem">Ecosystem</NavLink>
                            <NavLink href="#roadmap">Roadmap</NavLink>
                            <NavLink href="#join">Social</NavLink>
                            <NavLink href="#team">Team</NavLink>
                            <NavLink
                                href="https://broccoliswap.com/?inputToken=AVAX&inputChain=AVAX&outputToken=DGNX&outputChain=AVAX&amount=10"
                                target="_blank"
                            >
                                Buy
                            </NavLink>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-x-5 sm:flex-row md:gap-x-3 xl:gap-x-3">
                        <div className="hidden gap-x-5 sm:flex md:gap-x-3 xl:gap-x-3">
                            <Link
                                href="https://t.me/DEGENXecosystem"
                                className="group border-b-2 border-transparent pb-2 text-light-600 hover:border-degenOrange"
                                target="_blank"
                            >
                                <FaTelegramPlane className="size-6" />
                            </Link>
                            <Link
                                href="https://twitter.com/DegenEcosystem"
                                className="group border-b-2 border-transparent pb-2 text-light-600 hover:border-degenOrange"
                                target="_blank"
                            >
                                <div className="-mt-1 h-6 text-center text-2xl">𝕏</div>
                            </Link>
                            <Link
                                href="https://discord.gg/BMaVtEVkgC"
                                className="group border-b-2 border-transparent pb-2 text-light-600 hover:border-degenOrange"
                                target="_blank"
                            >
                                <FaDiscord className="size-6" />
                            </Link>
                            <Link
                                href="https://linktr.ee/DEGENX"
                                className="group border-b-2 border-transparent pb-2 text-light-600 hover:border-degenOrange"
                                target="_blank"
                            >
                                <SiLinktree className="size-6" />
                            </Link>
                        </div>
                        <DarkmodeToggle />
                        <div className="flex flex-row-reverse items-center gap-1 sm:flex-row">
                            <Button className="hidden gap-1 sm:flex lg:ml-3" href="/dapp/" color="orange">
                                <span>Launch app</span>
                                <BsArrowUpRight />
                            </Button>
                            <div className="-mr-1 lg:hidden">
                                <MobileNavigation />
                            </div>
                        </div>
                    </div>
                </nav>
            </Container>
        </header>
    )
}
