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
import { FaExternalLinkAlt } from 'react-icons/fa'

export const Hero = () => {
    return (
        <div>
            <div className="m-auto grid h-full max-w-7xl grid-cols-1 md:grid-cols-2 ">
                <div className="order-last flex flex-col justify-center gap-4 py-6 md:py-16 md:-order-last">
                    <span className="text-4xl font-bold leading-10 tracking-wide">
                        <span className="font-title font-extrabold">
                            <span className="text-techGreen">STAKE</span>
                            <span className="text-degenOrange">X</span>
                        </span>
                        <br />
                        Staking Solutions
                    </span>
                    <span className="text-2xl">
                        Store value of your project and incentivize your project token holders and investors
                    </span>
                    <span className="text-lg">
                        Benefit from our audited, secure, innovative,
                        <br className="hidden lg:inline" /> and out-of-the-box staking protocol
                    </span>
                    <div className="py-2">
                        <CallToActionButton />
                    </div>
                </div>
                <div className="relative flex flex-col items-center justify-center md:items-end">
                    <Image
                        src={heroImage}
                        alt="Hero Banner Image"
                        className="right-8 top-8 md:mt-10 w-[70%] md:absolute"
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
            <div className="m-auto mt-10 flex flex-col items-center justify-center gap-6 text-center sm:flex-row ">
                <div className="font-title text-2xl font-bold">
                    <span className="sm:whitespace-nowrap">
                        <Link href="/audits/20240522_STAKEX.pdf" target="_blank" className="hover:underline">
                            Smart Contract Security Audit
                        </Link>{' '}
                        <FaExternalLinkAlt className="relative -top-[2px] inline-block text-xl" />
                    </span>{' '}
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
