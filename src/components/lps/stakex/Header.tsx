import Link from 'next/link'
import { FaDiscord, FaGlobe, FaTelegram } from 'react-icons/fa'

export const Header = () => {
    return (
        <div className="flex flex-row p-8">
            <div className="flex-grow">
                <h1 className="flex w-full max-w-2xl flex-row font-title text-3xl font-bold tracking-wide">
                    <span className="text-techGreen">STAKE</span>
                    <span className="text-degenOrange">X</span>
                </h1>
                <span>
                    created by{' '}
                    <span className="font-title font-bold">
                        <span className=" text-techGreen">DEGEN</span>
                        <span className="text-degenOrange">X</span> Ecosystem
                    </span>
                </span>
            </div>
            <div className="flex flex-row items-center justify-end gap-4">
                <Link
                    href="https://discord.gg/BMaVtEVkgC"
                    target="_blank"
                    className="group text-dapp-cyan-50 md:text-dapp-cyan-50/70 md:hover:text-dapp-cyan-50"
                >
                    <FaDiscord className="h-6 w-6" />
                </Link>
                <Link
                    href="https://t.me/DEGENXecosystem"
                    target="_blank"
                    className="group text-dapp-cyan-50 md:text-dapp-cyan-50/70 md:hover:text-dapp-cyan-50"
                >
                    <FaTelegram className="h-6 w-6" />
                </Link>
                <Link
                    href="https://dgnx.finance"
                    target="_blank"
                    className="group text-dapp-cyan-50 md:text-dapp-cyan-50/70 md:hover:text-dapp-cyan-50"
                >
                    <FaGlobe className="h-6 w-6" />
                </Link>
            </div>
        </div>
    )
}
