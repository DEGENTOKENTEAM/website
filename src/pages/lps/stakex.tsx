import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { useTheme } from 'next-themes'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect } from 'react'
import { IoChevronDown } from 'react-icons/io5'
import { CallToActionButton } from 'src/components/lps/stakex/CallToAction'
import { InnerContainer, OuterContainer } from 'src/components/lps/stakex/Container'
import { Footer } from 'src/components/lps/stakex/Footer'
import { ForDevelopers } from 'src/components/lps/stakex/ForDevelopers'
import { ForHolders } from 'src/components/lps/stakex/ForHolders'
import { Header } from 'src/components/lps/stakex/Header'
import { Hero } from 'src/components/lps/stakex/Hero'
import whatCanStakeXDo from './../../images/lps/stakex/whatcanstakexdo.png'
import whatCanStakeXDoHolders from './../../images/lps/stakex/whatcanstakexdoholders.png'
import whatDoesStakeX from './../../images/lps/stakex/whatdoesstakex.png'
import whatIsStakeX from './../../images/lps/stakex/whatisstakex.png'

export default function Home() {
    const { setTheme } = useTheme()
    useEffect(() => setTheme('dark'))

    const projectDos = [
        {
            title: 'Easy Staking Pool Deployment',
            desc: 'Projects can set up staking pools with tailored lock periods, rewards, and payout mechanisms, without incurring upfront costs beyond gas fees.',
            open: true,
        },
        {
            title: 'Customizable Rewards',
            desc: 'Supports diverse reward structures, including multiple tokens and options to inject new rewards or payout tokens after deployment.',
            open: true,
        },
        {
            title: 'NFT Integration',
            desc: 'Stakes are represented as NFTs, enabling unique staking experiences and tradability while adhering to OpenSea standards.',
            open: true,
        },
        {
            title: 'Time-Limited Campaigns',
            desc: 'Projects can create exclusive staking events to drive community engagement and generate excitement around their tokens.',
            open: false,
        },
        {
            title: 'Revenue Generation',
            desc: 'Through gamified features like custom fees for staking actions (e.g., restaking, merging stakes), projects can create new revenue streams.',
            open: false,
        },
        {
            title: 'Brand Personalization',
            desc: "Add logos, banners, and tailored visuals to align the staking interface with the project's branding.",
            open: false,
        },
    ]

    const holdersDo = [
        {
            title: 'Stake Tokens',
            desc: 'Participate in staking pools with options for flexible or locked staking periods, earning rewards based on pool configurations.',
            open: true,
        },
        {
            title: 'Earn Rewards',
            desc: 'Receive multiple types of rewards, including custom tokens or payouts in different assets, thanks to diverse reward structures.',
            open: true,
        },
        {
            title: 'Trade or Transfer Stakes',
            desc: 'Since stakes are represented as NFTs, holders can trade or transfer their stakes on marketplaces like OpenSea.',
            open: true,
        },
        {
            title: 'Benefit from Infinite Staking',
            desc: 'Join pools with lifetime reward options by burning tokens for long-term benefits.',
            open: false,
        },
        {
            title: 'Enjoy Gamified Staking',
            desc: 'Engage with gamified staking mechanics, enhancing their experience while supporting the ecosystem.',
            open: false,
        },
        {
            title: 'Access a User-Friendly Platform',
            desc: 'Easily stake, monitor rewards, and manage their positions through an intuitive interface.',
            open: false,
        },
    ]

    return (
        <>
            <Head>
                <title>STAKEX - Audited and Secure Staking Solution</title>
                <link rel="canonical" href="/" />
                <meta
                    name="description"
                    content="STAKEX is a staking protocol developed by the DEGENX Ecosystem. It's available on chains like Ethereum, Avalanche, BNB Smart Chain, Arbitrum, Polygon, and Base. Take the opportunity to incentivize your token holders and store additional value of your project with an audited and secure staking contract"
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N95JDKHQ');`,
                    }}
                ></script>
            </Head>
            <noscript>
                <iframe
                    src="https://www.googletagmanager.com/ns.html?id=GTM-N95JDKHQ"
                    height="0"
                    width="0"
                    style={{ display: 'none', visibility: 'hidden' }}
                ></iframe>
            </noscript>
            <div className="w-full text-dapp-cyan-50">
                <div className="mx-auto max-w-7xl">
                    <Header />
                </div>
                <main className="website flex flex-col">
                    <OuterContainer className="w-full border-y border-dapp-blue-400 bg-dapp-blue-400/20">
                        <InnerContainer>
                            <Hero />
                        </InnerContainer>
                    </OuterContainer>

                    <div className="flex flex-row justify-center border-y border-dapp-blue-400 bg-dapp-cyan-50/5 p-16">
                        <CallToActionButton openBlank={true} href="/audits/20240522_STAKEX.pdf">
                            Show Security Audit
                        </CallToActionButton>
                    </div>

                    <OuterContainer id="whatisstakex" className="bg-dapp-blue-800/20">
                        <InnerContainer className="flex flex-col-reverse gap-8 py-8 md:flex-row md:gap-16 md:py-16">
                            <div className="flex flex-col justify-center gap-8 md:w-10/12">
                                <h2 className="font-title text-2xl font-bold">
                                    What is <span className="text-techGreen">STAKE</span>
                                    <span className="text-degenOrange">X</span>?
                                </h2>
                                <p>
                                    STAKEX is an audited staking protocol designed for EVM-compatible networks, enabling
                                    projects to create highly customizable staking pools without upfront costs. <br />
                                    <br />
                                    It supports features like multiple staking options, NFT-based stake representation,
                                    flexible reward mechanisms, and easy integration with DeFi ecosystems, including
                                    time-limited campaigns and infinite staking pools. <br />
                                    <br />
                                    With a user-friendly interface, extensive customization, and gamified revenue
                                    generation options, STAKEX empowers token holders and projects to maximize
                                    engagement, rewards, and profitability within the DeFi space.
                                </p>
                            </div>
                            <div>
                                <Image src={whatIsStakeX} alt="What is STAKEX image" className="w-full rounded-lg" />
                            </div>
                        </InnerContainer>
                    </OuterContainer>
                    <div className="flex flex-row justify-center border-y border-dapp-blue-400 bg-dapp-cyan-50/5 p-16">
                        <CallToActionButton href="https://docs.dgnx.finance/degenx-ecosystem/Products/stakex/introduction">
                            Open Documentation
                        </CallToActionButton>
                    </div>
                    <OuterContainer className="bg-dapp-blue-800/30">
                        <InnerContainer className="flex flex-col gap-8 py-8 md:flex-row md:gap-16 md:py-16">
                            <div className="flex flex-col justify-center">
                                <Image
                                    src={whatDoesStakeX}
                                    alt="What does STAKEX image"
                                    width={524}
                                    height={294}
                                    className="w-full rounded-lg"
                                />
                            </div>
                            <div className="flex flex-col justify-center gap-8 md:w-10/12">
                                <h2 className="font-title text-2xl font-bold">
                                    What does <span className="text-techGreen">STAKE</span>
                                    <span className="text-degenOrange">X</span> do for your project?
                                </h2>
                                <div className="flex flex-col gap-4">
                                    {projectDos.map((item, i) => (
                                        <Disclosure
                                            key={i}
                                            as="div"
                                            className="group flex w-full flex-col gap-4 rounded-xl bg-dapp-blue-800/50 p-6 leading-6"
                                            defaultOpen={item.open}
                                        >
                                            <DisclosureButton className="flex flex-row items-center text-left text-lg font-bold">
                                                <span className="flex-grow">{item.title}</span>
                                                <IoChevronDown className="size-5 fill-dapp-cyan-50 group-data-[open]:rotate-180" />
                                            </DisclosureButton>
                                            <DisclosurePanel
                                                transition
                                                className="origin-top transition duration-200 ease-out data-[closed]:-translate-y-6 data-[closed]:opacity-0"
                                            >
                                                {item.desc}
                                            </DisclosurePanel>
                                        </Disclosure>
                                    ))}
                                </div>
                            </div>
                        </InnerContainer>
                    </OuterContainer>
                    <div className="flex flex-row justify-center border-y border-dapp-blue-400 bg-dapp-cyan-50/5 p-16">
                        <CallToActionButton href="https://t.me/DEGENXecosystem">
                            Get in touch with us
                        </CallToActionButton>
                    </div>
                    <OuterContainer className="bg-dapp-blue-800/30">
                        <InnerContainer className="flex flex-col-reverse gap-8 py-8 md:flex-row md:gap-16 md:py-16">
                            <div className="flex flex-col justify-center gap-8 md:w-10/12">
                                <h2 className="font-title text-2xl font-bold">
                                    What can you do with <span className="text-techGreen">STAKE</span>
                                    <span className="text-degenOrange">X</span>?
                                </h2>
                                <p>
                                    With STAKEX, project owners can create customizable staking pools on EVM-compatible
                                    networks to boost token utility and community engagement. <br />
                                    <br />
                                    They can set flexible or time-limited staking options, add custom rewards and payout
                                    tokens, and represent stakes as tradable NFTs. <br />
                                    <br />
                                    Owners can personalize the platform with branding, monetize staking actions through
                                    custom fees, and drive liquidity and engagement via gamified features like infinite
                                    staking and campaign staking. <br />
                                    <br />
                                    STAKEX simplifies staking management, enabling revenue generation and ecosystem
                                    growth with minimal setup costs.
                                </p>
                            </div>
                            <div>
                                <Image
                                    src={whatCanStakeXDo}
                                    alt="What can STAKEX do image"
                                    width={524}
                                    height={294}
                                    className="w-full rounded-lg"
                                />
                            </div>
                        </InnerContainer>
                    </OuterContainer>
                    <ForDevelopers />

                    <div className="flex flex-row justify-center border-y border-dapp-blue-400 bg-dapp-cyan-50/5 p-16">
                        <CallToActionButton href="https://dgnx.finance/dapp/defitools/stakex/?ref=0xa1276e4d73a99db98acb225f9af69b50dafb8f7b71fd10284db0ca5e6b86fe9f">
                            Visit the STAKEX Creator now
                        </CallToActionButton>
                    </div>
                    <OuterContainer className="bg-dapp-blue-800/30">
                        <InnerContainer className="flex flex-col gap-8 py-8 md:flex-row md:gap-16 md:py-16">
                            <div className="flex flex-col justify-center">
                                <Image
                                    src={whatCanStakeXDoHolders}
                                    alt="What can STAKEX do for holders image"
                                    width={524}
                                    height={294}
                                    className="w-full rounded-lg"
                                />
                            </div>
                            <div className="flex flex-col justify-center gap-8 md:w-10/12">
                                <h2 className="font-title text-2xl font-bold">
                                    What can your token holders do with <span className="text-techGreen">STAKE</span>
                                    <span className="text-degenOrange">X</span>?
                                </h2>

                                <div className="flex flex-col gap-4">
                                    {holdersDo.map((item, i) => (
                                        <Disclosure
                                            key={i}
                                            as="div"
                                            className="group flex w-full flex-col gap-4 rounded-xl bg-dapp-blue-800/50 p-6 leading-6"
                                            defaultOpen={item.open}
                                        >
                                            <DisclosureButton className="flex flex-row items-center text-left text-lg font-bold">
                                                <span className="flex-grow">{item.title}</span>
                                                <IoChevronDown className="size-5 fill-dapp-cyan-50 group-data-[open]:rotate-180" />
                                            </DisclosureButton>
                                            <DisclosurePanel
                                                transition
                                                className="origin-top transition duration-200 ease-out data-[closed]:-translate-y-6 data-[closed]:opacity-0"
                                            >
                                                {item.desc}
                                            </DisclosurePanel>
                                        </Disclosure>
                                    ))}
                                </div>
                            </div>
                        </InnerContainer>
                    </OuterContainer>

                    <ForHolders />

                    <OuterContainer className="bg-dapp-blue-800/30">
                        <InnerContainer className="flex flex-col gap-8 py-16">
                            <h2 className="font-title text-2xl font-bold">
                                <span className="text-techGreen">STAKE</span>
                                <span className="text-degenOrange">X</span> Features
                            </h2>
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-title text-lg font-bold">Staking and Rewards Features</h3>
                                    <ul className="ml-6 list-outside list-disc">
                                        <li>Flexible and Time-Limited Staking Pools</li>
                                        <li>Custom Shared Rewards and Payout Tokens</li>
                                        <li>Infinite Staking with Lifetime Rewards</li>
                                        <li>Reward Injection (manual or automated)</li>
                                        <li>Merging and Adding Stakes</li>
                                    </ul>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-title text-lg font-bold">NFT Integration and Engagement</h3>
                                    <ul className="ml-6 list-outside list-disc">
                                        <li>NFT-Represented Stakes (tradable and transferable)</li>
                                        <li>Custom NFTs for Staking Pools</li>
                                        <li>OpenSea Metadata Compatibility</li>
                                        <li>Gamified Staking Mechanics</li>
                                    </ul>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-title text-lg font-bold">Management and Customization</h3>
                                    <ul className="ml-6 list-outside list-disc">
                                        <li>User-Friendly Management Interface</li>
                                        <li>Post-Deployment Reward and Payout Extensions</li>
                                        <li>Custom Fees for Staking Actions</li>
                                        <li>Branding Options (logos, banners)</li>
                                        <li>Pool Deletion and Parameter Adjustments</li>
                                        <li>Block- and Time-Based Activation</li>
                                    </ul>
                                </div>
                            </div>
                        </InnerContainer>
                    </OuterContainer>
                    <div className="flex flex-col justify-center gap-8 border-y border-dapp-blue-400 bg-dapp-cyan-50/5 p-16 md:flex-row md:gap-4">
                        <CallToActionButton href="https://dgnx.finance/dapp/defitools/stakex/?ref=0xa1276e4d73a99db98acb225f9af69b50dafb8f7b71fd10284db0ca5e6b86fe9f">
                            Visit the STAKEX Creator now
                        </CallToActionButton>
                        <CallToActionButton href="https://t.me/DEGENXecosystem" variant="secondary">
                            More questions? Join our Telegram
                        </CallToActionButton>
                    </div>
                </main>
                <div className="mx-auto max-w-7xl">
                    <Footer />
                </div>
            </div>
        </>
    )
}
