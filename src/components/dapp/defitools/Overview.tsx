import { Tile } from '@dappshared/Tile'
import clsx from 'clsx'
import Image from 'next/image'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../Button'

import imageBacking from '@public/defitools/backing.svg'
import imageSTAKEX from '@public/defitools/stakex.svg'

type DeFiToolType = {
    name: string
    logo: any
    to: string | null
    toLabel: string | null
    toMore: string | null
    description: string | null
}
// TODO get images imported so you don't need to add width and height
const defitools: DeFiToolType[] = [
    {
        name: 'STAKEX',
        logo: imageSTAKEX,
        to: './stakex/create/',
        toLabel: 'Create your own STAKEX',
        toMore: 'https://docs.dgnx.finance/degenx-ecosystem/Products/stakex/introduction',
        description: `STAKEX is an audited staking protocol providing a new staking methodology, powered by the DEGENX Ecosystem. It's a deployable protocol for projects based on EVM networks like Ethereum, Binance Smart Chain, and Avalanche.`,
    },
    {
        name: 'LIQUIDITY BACKING',
        logo: imageBacking,
        to: null,
        toLabel: 'Create your own Liquidity Backing',
        toMore: 'https://docs.dgnx.finance/degenx-ecosystem/Products/Liquidity_Backing/liquidity_backing',
        description:
            'Liquidity Backing is setting a foundational value for your project by establishing a growing pool of assets based on your total supply. This mechanism allows your holders to unlock their share of Liquidity Backing assets by choosing to burn their tokens. With this product, your project will earn more trust and security for the holders.',
    },
    // {
    //     name: 'LOCKR',
    //     logo: '/defitools/locker.svg',
    //     to: null,
    //     toLabel: 'Create a Locker',
    //     toMore: null,
    //     description:
    //         "Time-Lock your tokens the smart way! LOCKR is more than just a token locker. It's the perfect solution for keeping your tokens secure and also releasing them gradually over time. Easy to use and ideal for vesting, rewards or locking liquidity. A smart way to protect your assets.",
    // },
    // {
    //     name: 'DISBURSER',
    //     logo: '/defitools/disburser.svg',
    //     to: null,
    //     toLabel: 'Create a Disburser',
    //     toMore: null,
    //     description:
    //         'An innovative vesting protocol that pays out tokens based on the current amount of tokens held. It can be used to raise liquidity or to provide holding incentives.',
    // },
]

type DeFiToolTileProps = {
    data: DeFiToolType
    className?: string
}

const DeFiToolTile = ({ data, className }: DeFiToolTileProps) => {
    const navigate = useNavigate()
    const { to, toLabel, toMore, description, logo, name } = data
    return (
        <Tile className={clsx(['flex flex-col gap-8', className])}>
            <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex justify-center md:flex-grow-0">
                    <Image alt={`Logo of ${name}`} src={logo} className="w-full md:h-48" />
                </div>
                <div className="text-justify md:w-3/4 md:self-stretch">
                    <h2 className="text-xl font-bold">{name}</h2>
                    <p className="pt-2">{description}</p>
                </div>
            </div>
            <div>
                {(to || toMore) && (
                    <div className="md:flex-grow-1 flex flex-col-reverse justify-end gap-8 md:flex-row">
                        {toMore && (
                            <Button
                                onClick={() => {
                                    window.open(toMore, '_blank')
                                }}
                                variant="secondary"
                                className="h-14"
                            >
                                Read more
                            </Button>
                        )}
                        {to && (
                            <Button
                                onClick={() => {
                                    navigate(to)
                                }}
                                variant="primary"
                                className="h-14 animate-pulse"
                            >
                                {toLabel}
                            </Button>
                        )}
                    </div>
                )}
            </div>{' '}
        </Tile>
    )
}

export const DeFiToolsOverview = () => {
    return (
        <div className="mb-8 flex w-full max-w-5xl flex-col gap-8">
            <h1 className="flex w-full max-w-2xl flex-row items-end gap-1 px-8 font-title text-3xl font-bold tracking-wide sm:px-0">
                <span className="text-techGreen">DeFi</span>
                <span className="text-degenOrange">Tools</span>
            </h1>
            <div className="grid grid-cols-2 gap-8">
                {defitools.map((tool, i) => (
                    <DeFiToolTile data={tool} key={i} className={clsx(['col-span-2'])} />
                ))}
            </div>
        </div>
    )
}
