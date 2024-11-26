import Image from 'next/image'
import { Button } from './Button'
import { Container } from './Container'

import { H1 } from './H1'
import { H2 } from './H2'
import { BsSquareFill } from 'react-icons/bs'
import clsx from 'clsx'

import roadmap from '../images/roadmap.svg'

const RoadmapItem = (props: {
    quarter: string
    year: string
    items: { text: string; highlight?: boolean }[]
    first?: boolean
}) => {
    return (
        <>
            <div className="col-span-1 flex gap-2 sm:col-span-2 sm:block">
                <h3 className="text-3xl font-bold leading-none text-white sm:text-3xl md:text-4xl">{props.quarter},</h3>
                <h3 className="text-3xl font-bold leading-none text-white sm:text-3xl md:text-4xl">{props.year}</h3>
            </div>
            <div className="relative mx-3 hidden w-full items-center text-2xl sm:col-span-3 sm:mx-12 sm:flex">
                <div
                    className={clsx('absolute z-0 mx-[0.7rem] h-[150%] border border-white', props.first && 'top-1/2')}
                />
                <BsSquareFill className="z-10 mb-5 rotate-45 text-techGreen" />
            </div>
            <div className="col-span-1 sm:col-span-7">
                {props.items.map((item, i) => {
                    return (
                        <div key={i} className={item.highlight ? 'text-white' : 'text-white'}>
                            {item.text}
                        </div>
                    )
                })}
            </div>
            <div className="my-3 flex items-center justify-center text-2xl sm:hidden">
                <BsSquareFill className="z-10 rotate-45 text-techGreen" />
            </div>
        </>
    )
}

export function Roadmap() {
    return (
        <div className="relative mx-auto max-w-7xl" id="roadmap">
            <div
                className="absolute inset-0 z-0 hidden md:block"
                style={{
                    backgroundImage: `url(${roadmap.src})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '600px',
                    backgroundPosition: 'left 80%',
                }}
            ></div>
            <Container className="relative z-10 py-10 text-center">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="col-span-1">
                        <div className="text-center">
                            <H1 className=" leading-10">
                                The road <span className="text-degenOrange">ahead</span> is bright
                            </H1>
                        </div>
                        <p className="mx-8 mt-6 max-w-2xl text-left text-base font-semibold text-light-600 sm:px-10 md:mx-0 md:text-center">
                            Remembering our past achievements and forging a path into the future!
                        </p>
                    </div>
                    <div className="mt-5 rounded-lg border-2 border-activeblue bg-darkerblue px-8 py-6 text-left md:col-span-2 lg:px-16 lg:py-12">
                        <div className="relative grid grid-cols-1 gap-2 overflow-hidden font-semibold  sm:grid-cols-12">
                            <RoadmapItem
                                first
                                quarter="Q3"
                                year="2022"
                                items={[
                                    { text: 'DGNX launched on Avalanche', highlight: true },
                                    { text: 'LPs created on TraderJoe and Pangolin DEX' },
                                    { text: 'Website created' },
                                    { text: 'List on CMC / CG / Dextools' },
                                ]}
                            />
                            <RoadmapItem
                                quarter="Q4"
                                year="2022"
                                items={[
                                    { text: 'DAO public release', highlight: true },
                                    { text: 'Contract ownership transferred tot DAO' },
                                    { text: 'First successful on-chain DAO vote' },
                                    { text: 'Commence work on Liquidity Backing', highlight: true },
                                ]}
                            />
                            <RoadmapItem
                                quarter="Q1"
                                year="2023"
                                items={[
                                    { text: 'DEGENX Arcade lauched on Telegram', highlight: true },
                                    { text: 'BroccoliSwap formally announced' },
                                    { text: 'Dippy Degen Telegram game launch' },
                                    { text: 'First language specific Telegram group' },
                                ]}
                            />
                            <RoadmapItem
                                quarter="Q2"
                                year="2023"
                                items={[
                                    { text: 'Degen Jump Telegram game launch' },
                                    { text: 'Updates to various Telegram bots' },
                                    { text: 'DGNX Buy / Sell tax reduced to 8%', highlight: true },
                                    { text: 'Liquidity Backing audit completed' },
                                    { text: 'Liquidity Backing public release', highlight: true },
                                    { text: 'Commence work on DEGENX rebrand' },
                                    { text: 'Commence work on BroccoliSwap', highlight: true },
                                    { text: 'Commence work on LinkBridge', highlight: true },
                                ]}
                            />
                            <RoadmapItem
                                quarter="Q3"
                                year="2023"
                                items={[
                                    { text: 'Rebrand formally announced' },
                                    { text: 'Rebrand public release', highlight: true },
                                    { text: 'Broccoliswap enters beta testing' },
                                    { text: 'DGNX Buy / Sell tax reduced to 5%', highlight: true },
                                    { text: 'Rebranded website launched', highlight: true },
                                    { text: 'BroccoliSwap public release', highlight: true },
                                ]}
                            />
                            <RoadmapItem
                                quarter="Q4"
                                year="2023"
                                items={[
                                    { text: 'Add Arbitrum to BroccoliSwap' },
                                    { text: 'Launch Broccoliswap Pro' },
                                    { text: 'LinkBridge audit' },
                                ]}
                            />
                            <RoadmapItem
                                quarter="Q1"
                                year="2024"
                                items={[
                                    { text: 'Add Polygon and Fantom to BroccoliSwap' },
                                    { text: 'LinkBridge launch to ETH' },
                                ]}
                            />

                            <div className="col-span-1 sm:col-span-2">
                                <h3 className="text-xl font-bold leading-none text-white">Coming</h3>
                                <h3 className="text-xl font-bold leading-none text-white">Soon</h3>
                            </div>
                            <div className="relative mx-3 hidden w-full items-center text-2xl sm:col-span-3 sm:mx-12 sm:flex">
                                <div className="absolute bottom-1/2 z-0 mx-[0.7rem] h-full border border-white" />
                                <BsSquareFill className="z-10 mb-5 rotate-45 text-techGreen" />
                            </div>
                            <div className="col-span-1 sm:col-span-7">
                                <div className="text-light-600">LinkBridge launch to BSC</div>
                                <div className="text-light-600">Broccoliswap token sniffer</div>
                                <div className="text-light-600">StakeX</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}
