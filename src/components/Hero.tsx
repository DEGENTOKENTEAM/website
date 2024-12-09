import Image from 'next/image'

import { Button } from './Button'
import { Container } from './Container'

import translations from '../translations/site.json'
import { H1 } from './H1'
import { BsArrowUpRight } from 'react-icons/bs'

import dgnxSide from '../images/dgnx-side.png'

export function Hero() {
    return (
        <div className="relative mx-auto max-w-7xl">
            <div
                className="absolute inset-0 hidden opacity-40 md:block"
                style={{
                    backgroundImage: `url(${dgnxSide.src})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center right',
                }}
            />
            <Container className="relative z-10 pt-5 text-center md:pb-16 md:pt-20 lg:pt-20">
                <div className="mx-8 text-left md:mx-0 md:text-left">
                    <H1 className="text-4xl font-semibold leading-10 md:text-5xl md:leading-normal">
                        <span className="block text-techGreen">SIMPLICITY</span>
                        <span className="block text-white md:ml-24 md:mr-3 md:inline">MEETS</span>
                        <span className="block text-degenOrange md:inline">INNOVATION</span>
                    </H1>
                </div>
                <p className="mx-8 mt-3 max-w-2xl text-left font-semibold text-light-600 md:mx-0 md:mt-6">
                    Welcome to DEGENX, the ultimate multichain DeFi ecosystem! Stake DGNX, influence governance, and
                    enjoy revenue-sharing rewards. Rest easy with Liquidity Backing, while exploring innovative DeFi
                    products across multiple blockchains.
                </p>
                <div className="mx-4 mt-5 flex md:mx-0">
                    <div className="w-3 border-y-2 border-l-2 border-techGreen" />
                    <ul className="ml-4 list-disc py-2 text-left font-bold text-white">
                        <li>Powered by DGNX on Avalanche</li>
                        <li>100% DAO owned and controlled</li>
                        <li>Contract Audited and Team KYC</li>
                    </ul>
                </div>
                <div className="mt-10 flex justify-center gap-x-6">
                    <Button className="flex gap-1 lg:ml-3" href="/dapp/" color="orange">
                        <span>Launch app</span>
                        <BsArrowUpRight />
                    </Button>
                    <Button href="https://docs.dgnx.finance/" variant="outline" color="orange" target="_blank">
                        <span className="flex items-center gap-1">
                            Open docs <BsArrowUpRight />
                        </span>
                    </Button>
                </div>
            </Container>
            <div className="block w-full opacity-40 md:hidden">
                <Image src={dgnxSide} alt="DGNX" />
            </div>
        </div>
    )
}
