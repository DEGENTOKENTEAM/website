import { Container } from './Container'

import Link from 'next/link'
import {
    FaDiscord,
    FaInstagram,
    FaTelegramPlane,
    FaTiktok,
} from 'react-icons/fa'
import { SiLinktree } from 'react-icons/si'

export function Discover() {
    return (
        <Container className="py-10 text-center text-light-600">
            Discover our ecosystem
            <div className="mt-3 flex items-center justify-center gap-x-6">
                <Link
                    href="https://t.me/DEGENXecosystem"
                    target="_blank"
                    className="group"
                >
                    <FaTelegramPlane className="size-6 text-light-600 hover:text-light-200" />
                </Link>
                <Link
                    href="https://twitter.com/degenecosystem"
                    target="_blank"
                    className="group"
                >
                    <div className="-mt-1 h-6 text-center text-2xl text-light-600 hover:text-light-200">
                        𝕏
                    </div>
                </Link>
                <Link
                    href="https://discord.gg/BMaVtEVkgC"
                    target="_blank"
                    className="group"
                >
                    <FaDiscord className="size-6 text-light-600 hover:text-light-200" />
                </Link>
                <Link
                    href="https://instagram.com/degenecosystem"
                    target="_blank"
                    className="group"
                >
                    <FaInstagram className="size-6 text-light-600 hover:text-light-200" />
                </Link>
                <Link
                    href="https://www.tiktok.com/@degen_traders"
                    target="_blank"
                    className="group"
                >
                    <FaTiktok className="size-6 text-light-600 hover:text-light-200" />
                </Link>
                <Link
                    href="https://linktr.ee/DEGENX"
                    target="_blank"
                    className="group"
                >
                    <SiLinktree className="size-6 text-light-600 hover:text-light-200" />
                </Link>
            </div>
        </Container>
    )
}
