/* eslint-disable react/no-unescaped-entities */
import { Carousel } from 'flowbite-react'
import Image from 'next/image'
import { Button } from './Button'
import { Container } from './Container'

import { BsArrowUpRight } from 'react-icons/bs'
import { PiCaretLeftLight, PiCaretRightLight } from 'react-icons/pi'
import { H1 } from './H1'

import imageBridge from '../images/projects/bridge.svg'
import imageBrocSwap from '../images/projects/brocswap.svg'
import imageDAO from '../images/projects/dao-small.svg'
import imageLiqBack from '../images/projects/liqback.svg'

const Slide = (props: {
    name: string
    logo: string
    text: string
    children: any
}) => {
    return (
        <div className="h-full sm:px-20">
            <div className="flex h-full flex-col items-center justify-start rounded-xl border-2 border-activeblue bg-darkerblue p-5 pb-12">
                <div className="mb-5 flex h-16 w-full items-center justify-center">
                    <Image
                        alt={`DEGENX ${props.name} logo`}
                        src={props.logo}
                        height={64}
                        // fill
                    />
                </div>
                <p>{props.text}</p>
                {props.children && (
                    <div className="flex h-full flex-col items-end sm:flex-row sm:gap-4">
                        {props.children}
                    </div>
                )}
            </div>
        </div>
    )
}

export function Projects() {
    return (
        <Container className="pb-10 pt-10 text-center" id="ecosystem">
            <div className="text-center">
                <H1 className="leading-10">
                    <span className="text-techGreen">Explore</span> our
                    ecosystem
                </H1>
            </div>
            <p className="mx-8 text-left font-semibold text-light-600 md:mx-0 md:text-center">
                Our present and future products and services for both projects
                and users
            </p>

            <div className="mt-5 flex h-auto">
                <Carousel
                    slide
                    slideInterval={1000000}
                    leftControl={
                        <>
                            <div className="hidden cursor-pointer rounded-full border-2 border-activeblue bg-darkerblue p-3 hover:bg-dark sm:block">
                                <PiCaretLeftLight />
                            </div>
                            <div className="absolute bottom-3 left-3 block cursor-pointer rounded-full border-2 border-activeblue bg-darkerblue p-2 hover:bg-dark sm:hidden">
                                <PiCaretLeftLight />
                            </div>
                        </>
                    }
                    rightControl={
                        <>
                            <div className="hidden cursor-pointer rounded-full border-2 border-activeblue bg-darkerblue p-3 hover:bg-dark sm:block">
                                <PiCaretRightLight />
                            </div>
                            <div className="absolute bottom-3 right-3 block cursor-pointer rounded-full border-2 border-activeblue bg-darkerblue p-2 hover:bg-dark sm:hidden">
                                <PiCaretRightLight />
                            </div>
                        </>
                    }
                    indicators
                    theme={{
                        indicators: {
                            active: {
                                off: 'bg-darkblue',
                                on: 'bg-activeblue',
                            },
                        },
                    }}
                >
                    <Slide
                        logo={imageLiqBack}
                        name="liquidity backing"
                        text="Liquidity Backing is a feature that creates a secondary asset pool, separate to the regular exchange liquidity pools. With every buy and sell transaction, a portion of the transaction tax flows into the Liquidity Backing pool. Revenue generated by our other products and services will also partially fund Liquidity Backing. Claim Your Share: Burn your tokens to unlock and get your portion instantly. Maximise Profits: Spot arbitrage opportunities for bigger gains!"
                    >
                        <Button
                            className="mb-2 mt-4 flex gap-2"
                            href="/dapp/liquidity-backing"
                            color="orange"
                            target="_blank"
                        >
                            <span>Visit Dashboard</span>
                            <BsArrowUpRight />
                        </Button>
                        <Button
                            className="mb-2 mt-2 flex gap-2 sm:mt-4"
                            href="https://docs.dgnx.finance/degenx-ecosystem/Products/Liquidity_Backing/liquidity_backing"
                            variant="outline"
                            color="orange"
                            target="_blank"
                        >
                            <span>Documentation</span>
                            <BsArrowUpRight />
                        </Button>
                    </Slide>
                    <Slide
                        logo={imageBrocSwap}
                        name="broccoliswap"
                        text="Broccoliswap is the easiest to use multi-chain swap aggregator. Without any effort, bridge any token from any supported chain to any other supported chain. Includes automatic slippage calculation, token tax calculation, bridging (without constant network switching). A tiny swap fee is taken that is sent to our liquidity backing and upcoming staking pools."
                    >
                        <Button
                            className="mb-2 mt-4 flex gap-2"
                            href="https://broccoliswap.com"
                            color="orange"
                            target="_blank"
                        >
                            <span>Visit BroccoliSwap</span>
                            <BsArrowUpRight />
                        </Button>
                        <Button
                            className="mb-2 mt-2 flex gap-2 sm:mt-4"
                            href="https://docs.dgnx.finance/degenx-ecosystem/Products/broccoliswap/broccoliswap"
                            variant="outline"
                            color="orange"
                            target="_blank"
                        >
                            <span>Documentation</span>
                            <BsArrowUpRight />
                        </Button>
                    </Slide>
                    <Slide
                        logo={imageDAO}
                        name="dao"
                        text="DEGENX is a DAO at heart. All contracts are owned by the DAO. This means that even changing our token tax can only be done by passing a vote. This should give you trust that no single person has control over the project."
                    >
                        <Button
                            className="mb-2 mt-4 flex gap-2"
                            href="https://www.tally.xyz/gov/degenx-ecosystem"
                            color="orange"
                            target="_blank"
                        >
                            <span>Show DAO proposals</span>
                            <BsArrowUpRight />
                        </Button>
                        <Button
                            className="mb-2 mt-2 flex gap-2 sm:mt-4"
                            href="https://docs.dgnx.finance/degenx-ecosystem/Governance/intro_governance"
                            variant="outline"
                            color="orange"
                            target="_blank"
                        >
                            <span>Documentation</span>
                            <BsArrowUpRight />
                        </Button>
                    </Slide>
                    <Slide
                        logo={imageBridge}
                        name="bridge"
                        text="DGNX can be bridged from Avalanche to Ethereum (later BNB Smart Chain). Not only is it a token bridge, our custom built contracts will also transfer DAO decisions to other chains. The bridge will be natively integrated into our other products for seamless interaction on every supported chain."
                    >
                        <Button
                            className="mb-2 mt-4 flex gap-2"
                            href="https://broccoliswap.com"
                            color="orange"
                            target="_blank"
                        >
                            <span>Visit BroccoliSwap</span>
                            <BsArrowUpRight />
                        </Button>
                        <Button
                            className="mb-2 mt-2 flex gap-2 sm:mt-4"
                            href="https://docs.dgnx.finance/degenx-ecosystem/Products/linkbridge"
                            variant="outline"
                            color="orange"
                            target="_blank"
                        >
                            <span>Documentation</span>
                            <BsArrowUpRight />
                        </Button>
                    </Slide>
                </Carousel>
            </div>
        </Container>
    )
}
