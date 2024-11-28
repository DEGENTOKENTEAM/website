import imageSolidproof from '@public/audits/solidproof_white.svg'
import imageEthereum from '@public/chains/1.svg'
import imagePolygon from '@public/chains/137.svg'
import imageArbitrum from '@public/chains/42161.svg'
import imageAvalanche from '@public/chains/43114.svg'
import imageBSC from '@public/chains/56.svg'
import imageBase from '@public/chains/8453.svg'
import Image from 'next/image'
import Link from 'next/link'
import { FaExternalLinkAlt } from 'react-icons/fa'
import heroImage from './../../../images/lps/stakex/hero.png'
import { CallToActionButton } from './CallToAction'

export const Hero = () => {
    return (
        <div>
            <div className="m-auto grid h-full max-w-7xl grid-cols-1 md:grid-cols-2 ">
                <div className="relative order-last flex flex-col justify-center gap-4 py-6 md:-order-last md:bg-none md:py-16">
                    <Image
                        src={heroImage}
                        alt="Hero Banner Image"
                        className="absolute inset-0 mx-auto w-[80%] opacity-10 md:hidden"
                    />
                    <span className="mt-28 text-7xl font-bold tracking-wide md:mt-0">
                        <h1 className="m-0 p-0 font-title font-extrabold">
                            <span className="text-techGreen">STAKE</span>
                            <span className="text-degenOrange">X</span>
                        </h1>
                    </span>
                    <span className="text-2xl">
                        Staking made simple! Secure your projects health, boost your community engagement, incentivize
                        your holders
                    </span>
                    <span className="text-lg">
                        Take advantage from our audited, secure, innovative,
                        <br className="hidden lg:inline" /> and out-of-the-box staking solutions
                    </span>
                    <div className="flex flex-row gap-4 py-2">
                        <CallToActionButton href="#whatisstakex">Tell me more</CallToActionButton>
                        <CallToActionButton href="https://t.me/DEGENXecosystem" variant="secondary">
                            Contact us
                        </CallToActionButton>
                    </div>
                </div>
                <div className="relative flex flex-col items-center justify-center md:items-end">
                    <Image
                        src={heroImage}
                        alt="Hero Banner Image"
                        className="absolute right-8 top-8 mt-10 hidden w-[70%] md:block"
                    />
                </div>
            </div>

            <div className="m-auto mt-10 flex flex-col gap-8 text-center">
                <div className="font-title text-2xl font-bold">Supported Networks</div>
                <div className="flex flex-row justify-center gap-4 md:gap-12">
                    <Image
                        src={imageAvalanche}
                        alt="Support Avalanche Network Image"
                        className="size-12 md:size-16 md:grayscale md:hover:filter-none"
                    />
                    {/* <Image
                        src={imageEthereum}
                        alt="Support Ethereum Network Image"
                        className="size-12 md:size-16 md:grayscale md:hover:filter-none"
                    /> */}
                    <Image
                        src={imageBase}
                        alt="Support Base Network Image"
                        className="size-12 md:size-16 md:grayscale md:hover:filter-none"
                    />
                    <Image
                        src={imageBSC}
                        alt="Support BNB Smart Chain Network Image"
                        className="size-12 md:size-16 md:grayscale md:hover:filter-none"
                    />
                    <Image
                        src={imageArbitrum}
                        alt="Support Arbitrum Network Image"
                        className="size-12 md:size-16 md:grayscale md:hover:filter-none"
                    />
                    <Image
                        src={imagePolygon}
                        alt="Support Polygon Network Image"
                        className="size-12 md:size-16 md:grayscale md:hover:filter-none"
                    />
                </div>
            </div>
            <div className="m-auto mt-10 flex flex-col items-center justify-center gap-6 text-center sm:flex-row ">
                <div className="font-title text-2xl font-bold">Smart Contract Security Audit by</div>
                <div>
                    <Link href="https://solidproof.io/" target="_blank">
                        <Image src={imageSolidproof} alt="Solidproof Logo White" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
