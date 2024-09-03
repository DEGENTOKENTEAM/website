import { useTheme } from 'next-themes'
import Head from 'next/head'
import Image from 'next/image'
import { CallToAction } from 'src/components/lps/stakex/CallToAction'
import { InnerContainer, OuterContainer } from 'src/components/lps/stakex/Container'
import { Footer } from 'src/components/lps/stakex/Footer'
import { Header } from 'src/components/lps/stakex/Header'
import { Hero } from 'src/components/lps/stakex/Hero'
import dummyImage from './../../images/lps/stakex/dummy-image-16-9.png'

export default function Home() {
    const { setTheme } = useTheme()
    setTheme('dark')
    return (
        <>
            <Head>
                <title>STAKEX - Audited and Secure Staking Solution</title>
                <meta
                    name="description"
                    content="STAKEX is a staking protocol developed by the DEGENX Ecosystem. It's available on chains like Ethereum, Avalanche, BNB Smart Chain, Arbitrum, Polygon, and Base. Take the opportunity to incentivize your token holders and store additional value of your project with an audited and secure staking contract"
                />
            </Head>
            <div className="w-full">
                <div className="mx-auto max-w-7xl">
                    <Header />
                </div>
                <main className="website flex flex-col">
                    <OuterContainer className="w-full border-b border-t border-dapp-blue-400 bg-dapp-blue-400/20">
                        <InnerContainer>
                            <Hero />
                        </InnerContainer>
                    </OuterContainer>
                    <OuterContainer className="bg-dapp-blue-800/20">
                        <InnerContainer className="flex flex-col gap-8 py-16 md:flex-row">
                            <div className="flex flex-col gap-8">
                                <h2 className="font-title text-2xl font-bold">
                                    What is <span className="text-techGreen">STAKE</span>
                                    <span className="text-degenOrange">X</span>?
                                </h2>
                                <p>
                                    STAKEX is an audited staking protocol providing a new staking methodology, powered
                                    by the DEGENX Ecosystem. It&apos;s a deployable protocol for projects based on EVM
                                    networks like Ethereum, Binance Smart Chain, Base, Arbitrum, Avalanche, and more.
                                </p>
                            </div>
                            <div>
                                <Image src={dummyImage} alt="Dummy Image" width={524} height={294} className="w-full rounded-lg" />
                            </div>
                        </InnerContainer>
                    </OuterContainer>
                    <div className="flex flex-row justify-center border-b border-t border-dapp-blue-400 bg-dapp-cyan-50/5 p-16">
                        <CallToAction />
                    </div>
                    <OuterContainer className="bg-dapp-blue-800/30">
                        <InnerContainer className="flex flex-col gap-8 py-16 md:flex-row">
                            <div>
                                <Image src={dummyImage} alt="Dummy Image" width={524} height={294} className="w-full rounded-lg" />
                            </div>
                            <div className="flex flex-col gap-8">
                                <h2 className="font-title text-2xl font-bold">
                                    What does <span className="text-techGreen">STAKE</span>
                                    <span className="text-degenOrange">X</span> do for your project?
                                </h2>
                                <p>
                                    STAKEX is an advanced staking protocol offering multiple pools with customizable
                                    lock-up periods and rewards. It supports various networks like Ethereum and Binance
                                    Smart Chain, and integrates NFTs to represent and trade staking rewards. Users can
                                    customize reward tokens, payout options, and design unique NFTs. This protocol is
                                    ideal for DeFi enthusiasts looking for innovative and profitable staking
                                    opportunities.
                                </p>
                            </div>
                        </InnerContainer>
                    </OuterContainer>
                    <div className="flex flex-row justify-center border-b border-t border-dapp-blue-400 bg-dapp-cyan-50/5 p-16">
                        <CallToAction />
                    </div>
                    <OuterContainer className="bg-dapp-blue-800/30">
                        <InnerContainer className="flex flex-col gap-8 py-16 md:flex-row">
                            <div className="flex flex-col gap-8">
                                <h2 className="font-title text-2xl font-bold">
                                    What can you do with <span className="text-techGreen">STAKE</span>
                                    <span className="text-degenOrange">X</span>?
                                </h2>
                                <p>
                                    With STAKEX, you have the flexibility to inject multiple reward tokens, configure
                                    different payout options, and even design unique NFTs. This allows for a
                                    personalized staking experience that caters to different investment strategies
                                    within the DeFi space.
                                </p>
                            </div>
                            <div>
                                <Image src={dummyImage} alt="Dummy Image" width={524} height={294} className="w-full rounded-lg" />
                            </div>
                        </InnerContainer>
                    </OuterContainer>
                    <div className="flex flex-row justify-center border-b border-t border-dapp-blue-400 bg-dapp-cyan-50/5 p-16">
                        <CallToAction />
                    </div>
                    <OuterContainer className="bg-dapp-blue-800/30">
                        <InnerContainer className="flex flex-col gap-8 py-16 md:flex-row">
                            <div>
                                <Image src={dummyImage} alt="Dummy Image" width={524} height={294} className="w-full rounded-lg" />
                            </div>
                            <div className="flex flex-col gap-8">
                                <h2 className="font-title text-2xl font-bold">
                                    What can your token holders do with <span className="text-techGreen">STAKE</span>
                                    <span className="text-degenOrange">X</span>?
                                </h2>
                                <p>
                                    With STAKEX, you token holders can stake their tokens in various customizable pools,
                                    each offering different lock-up periods and rewards. They will also receive NFTs
                                    that represent their staking options. Additionally your token holders are able to
                                    trade the NFTs.
                                </p>
                            </div>
                        </InnerContainer>
                    </OuterContainer>

                    <div className="flex flex-row justify-center border-b border-t border-dapp-blue-400 bg-dapp-cyan-50/5 p-16">
                        <CallToAction />
                    </div>

                    <OuterContainer className="bg-dapp-blue-800/30">
                        <InnerContainer className="flex flex-col gap-8 py-16">
                            <h2 className="font-title text-2xl font-bold">
                                Additional <span className="text-techGreen">STAKE</span>
                                <span className="text-degenOrange">X</span> Features
                            </h2>
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                                <div>
                                    <h3 className="font-title text-lg font-bold">Core Features</h3>
                                    <ul className="ml-6 list-outside list-disc">
                                        <li>Multiple Pools</li>
                                        <li>Multiple Tokens</li>
                                        <li>Custom Rewards</li>
                                        <li>UniswapV2-type AMM support</li>
                                        <li>Infinite Pool Option</li>
                                        <li>Open/Restricted Reward Injection</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-title text-lg font-bold">Management and Customization</h3>
                                    <ul className="ml-6 list-outside list-disc">
                                        <li>Management UI</li>
                                        <li>Post-Deployment Extensions</li>
                                        <li>Custom Fees</li>
                                        <li>Block- and Time-Based Activation</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-title text-lg font-bold">NFT Integration</h3>
                                    <ul className="ml-6 list-outside list-disc">
                                        <li>NFT Representation</li>
                                        <li>SVG Composition Tool (in progress)</li>
                                        <li>Protocol Metrics as SVG Elements</li>
                                        <li>OpenSea Metadata Standard</li>
                                    </ul>
                                </div>
                            </div>
                        </InnerContainer>
                    </OuterContainer>
                    <div className="flex flex-row justify-center border-b border-t border-dapp-blue-400 bg-dapp-cyan-50/5 p-16">
                        <CallToAction />
                    </div>
                </main>
                <div className="mx-auto max-w-7xl">
                    <Footer />
                </div>
            </div>
        </>
    )
}
