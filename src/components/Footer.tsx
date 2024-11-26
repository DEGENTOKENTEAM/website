import Image from 'next/image'
import Link from 'next/link'
import { FaDiscord, FaInstagram, FaTelegramPlane, FaTiktok } from 'react-icons/fa'

import { Container } from './Container'

import logoImage from '../images/logo_large.png'

import { SiLinktree } from 'react-icons/si'
import translations from '../translations/site.json'

export function Footer() {
    return (
        <footer className="">
            <Container>
                <div className="pb-8 pt-16">
                    <Image className="mx-auto h-10 w-auto" src={logoImage} alt="" width={56} height={56} />
                </div>
                <div className="pb-8 text-center text-slate-500">
                    Avalanche:{' '}
                    <a
                        className="text-slate-500 hover:text-light-200"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://snowscan.xyz/token/0x51e48670098173025c477d9aa3f0eff7bf9f7812/balances?chainId=43114"
                    >
                        0x51e48670098173025c477d9aa3f0eff7bf9f7812
                    </a>
                    <br />
                    Ethereum:{' '}
                    <a
                        className="text-slate-500 hover:text-light-200"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://etherscan.io/address/0x0000000000300dd8B0230efcfEf136eCdF6ABCDE"
                    >
                        0x0000000000300dd8B0230efcfEf136eCdF6ABCDE
                    </a>
                </div>
                <div className="flex flex-col items-center border-t border-slate-400/10 py-10 sm:flex-row-reverse sm:justify-between">
                    <div className="flex gap-x-6">
                        <Link href="https://t.me/DEGENXecosystem" target="_blank" className="group">
                            <FaTelegramPlane className="size-6 text-light-600 hover:text-light-200" />
                        </Link>
                        <Link href="https://twitter.com/degenecosystem" target="_blank" className="group">
                            <div className="-mt-1 h-6 text-center text-2xl text-light-600 hover:text-light-200">𝕏</div>
                        </Link>
                        <Link href="https://discord.gg/BMaVtEVkgC" target="_blank" className="group">
                            <FaDiscord className="size-6 text-light-600 hover:text-light-200" />
                        </Link>
                        <Link href="https://instagram.com/degenecosystem" target="_blank" className="group">
                            <FaInstagram className="size-6 text-light-600 hover:text-light-200" />
                        </Link>
                        <Link href="https://www.tiktok.com/@degen_traders" target="_blank" className="group">
                            <FaTiktok className="size-6 text-light-600 hover:text-light-200" />
                        </Link>
                        <Link href="https://linktr.ee/DEGENX" target="_blank" className="group">
                            <SiLinktree className="size-6 text-light-600 hover:text-light-200" />
                        </Link>
                    </div>
                    <p className="mt-6  text-slate-500 sm:mt-0">
                        {translations.footer.copyright.en} 🥦 {new Date().getFullYear()}{' '}
                        {translations.footer.reservedRights.en}
                    </p>
                </div>
            </Container>
        </footer>
    )
}
