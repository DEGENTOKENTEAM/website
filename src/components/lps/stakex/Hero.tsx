import imageSolidproof from '@public/audits/solidproof_white.svg'
import imageEthereum from '@public/chains/1.svg'
import imagePolygon from '@public/chains/137.svg'
import imageArbitrum from '@public/chains/42161.svg'
import imageAvalanche from '@public/chains/43114.svg'
import imageBSC from '@public/chains/56.png'
import imageBase from '@public/chains/8453.svg'
import Image from 'next/image'
import Link from 'next/link'
import heroImage from './../../../images/lps/stakex/hero.png'
import { CallToActionButton } from './CallToAction'

export const Hero = () => {
    return (
        <div>
            <div className="m-auto grid h-full max-w-7xl grid-cols-1 md:grid-cols-2 ">
                <div className="order-last flex flex-col justify-center gap-4 py-10 md:-order-last">
                    <span className="font-title text-4xl font-bold tracking-wide">
                        <span className="text-techGreen">STAKE</span>
                        <span className="text-degenOrange">X</span>
                        <br />
                        Staking Solution
                    </span>
                    <span className="text-2xl">
                        Store value of your project and incentivize your project token holders and investors
                    </span>
                    <span className="text-lg">Benefit from our audited, secure, and innovative staking protocol</span>
                    <div className="py-2">
                        <CallToActionButton />
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center md:items-end">
                    <Image
                        src={heroImage}
                        alt="Hero Banner Image"
                        className="rounded-lg md:max-h-[70%] md:max-w-[70%] md:rounded-lg md:object-cover"
                    />
                </div>
            </div>

            <div className="m-auto mt-10 flex flex-col gap-8 text-center">
                <div className="font-title text-2xl font-bold">Supported Networks</div>
                <div className="flex flex-row justify-center gap-4 md:gap-12">
                    <Image
                        src={imageAvalanche}
                        alt="Support Avalanche Network Image"
                        className="h-12 w-12 md:h-16 md:w-16 md:grayscale md:hover:filter-none"
                    />
                    <Image
                        src={imageEthereum}
                        alt="Support Avalanche Network Image"
                        className="h-12 w-12 md:h-16 md:w-16 md:grayscale md:hover:filter-none"
                    />
                    <Image
                        src={imageBase}
                        alt="Support Avalanche Network Image"
                        className="h-12 w-12 md:h-16 md:w-16 md:grayscale md:hover:filter-none"
                    />
                    <Image
                        src={imageBSC}
                        alt="Support Avalanche Network Image"
                        className="h-12 w-12 md:h-16 md:w-16 md:grayscale md:hover:filter-none"
                    />
                    <Image
                        src={imageArbitrum}
                        alt="Support Avalanche Network Image"
                        className="h-12 w-12 md:h-16 md:w-16 md:grayscale md:hover:filter-none"
                    />
                    <Image
                        src={imagePolygon}
                        alt="Support Avalanche Network Image"
                        className="h-12 w-12 md:h-16 md:w-16 md:grayscale md:hover:filter-none"
                    />
                </div>
            </div>
            <div className="m-auto mt-10 flex flex-col items-center justify-center gap-4 text-center sm:flex-row ">
                <div className="font-title text-2xl font-bold">
                    <Link
                        href="/audits/20240522_STAKEX.pdf"
                        target="_blank"
                        className="text-dapp-cyan-500 underline hover:text-dapp-cyan-50"
                    >
                        <span className="!text-dapp-cyan-50">Smart Contract Security Audit</span>
                    </Link>{' '}
                    by
                </div>
                <div>
                    <Link href="https://solidproof.io/" target="_blank">
                        <Image src={imageSolidproof} alt="Solidproof Logo White" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
