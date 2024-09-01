import Head from 'next/head'
import { useRouter } from 'next/router'
import { CallToAction } from 'src/components/lps/stakex/CallToAction'
import { Header } from 'src/components/lps/stakex/Header'
import { Hero } from 'src/components/lps/stakex/Hero'

export default function Home() {
    const { isReady } = useRouter()
    return (
        isReady && (
            <>
                <Head>
                    <title>DEGENX Ecosystem</title>
                    <meta
                        name="description"
                        content="DEGENX is multichain ecosystem that offers a suite of decentralized applications (dApps) and services to provide solutions for projects and individuals in the DeFi space. $DGNX is a multichain token with liquidity backing."
                    />
                </Head>
                <div className="w-full">
                    <div className="mx-auto max-w-7xl">
                        <Header />
                    </div>
                    <main className="website flex flex-col gap-8">
                        <Hero />
                        <CallToAction />
                        <span>What is STAKEX?</span>
                        <CallToAction />
                        <span>What does STAKEX do for your project?</span>
                        <CallToAction />
                        <span>What can you do with STAKEX?</span>
                        <CallToAction />
                        <span>What can your token holder do with STAKEX?</span>
                        <CallToAction />
                        {/* <Hero />
                    <Empower />
                    <Projects />
                    <Discover />
                    <Roadmap />
                    <CallToAction />
                    <Team /> */}
                    </main>
                    {/* <Footer /> */}
                </div>
            </>
        )
    )
}
