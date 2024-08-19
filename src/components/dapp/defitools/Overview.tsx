import { Tile } from '@dappshared/Tile'
import clsx from 'clsx'
import Image from 'next/image'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../Button'

type DeFiToolType = {
    name: string
    logo: any
    to: string | null
    toLabel: string | null
    toMore: string | null
    description: string | null
}

const defitools: DeFiToolType[] = [
    {
        name: 'STAKEX',
        logo: '/defitools/dummy-defitools-logo.png',
        to: './stakex/create',
        toLabel: 'Create your own STAKEX',
        toMore: 'https://docs.dgnx.finance/degenx-ecosystem/Products/stakex/introduction',
        description: `STAKEX is an audited staking protocol providing a new staking methodology, powered by the DEGENX Ecosystem. It's a deployable protocol for projects based on EVM networks like Ethereum, Binance Smart Chain, and Avalanche.`,
    },
    {
        name: 'LIQUIDITY BACKING',
        logo: '/defitools/dummy-defitools-logo.png',
        to: null,
        toLabel: 'Create your own Liquidity Backing',
        toMore: 'https://docs.dgnx.finance/degenx-ecosystem/Products/Liquidity_Backing/liquidity_backing',
        description:
            'Liquidity Backing is setting a foundational value for your project by establishing a growing pool of assets based on your total supply. This mechanism allows your holders to unlock their share of Liquidity Backing assets by choosing to burn their tokens. With this product, your project will earn more trust and security for the holders.',
    },
    {
        name: 'LOCKER',
        logo: '/defitools/dummy-defitools-logo.png',
        to: null,
        toLabel: 'Create a Locker',
        toMore: null,
        description: 'TBD',
    },
    {
        name: 'DISBURSER',
        logo: '/defitools/dummy-defitools-logo.png',
        to: null,
        toLabel: 'Create a Disburser',
        toMore: null,
        description: 'TBD',
    },
]

type DeFiToolTileProps = {
    data: DeFiToolType
    hero?: boolean
    className?: string
}

const DeFiToolTile = ({ data, hero, className }: DeFiToolTileProps) => {
    const navigate = useNavigate()
    const { to, toLabel, toMore, description, logo, name } = data
    return (
        <Tile className={clsx(['flex flex-col gap-8', className])}>
            <div className="flex flex-row gap-8">
                <div className="flex-shrink-0 flex-grow-0">
                    <Image
                        alt={`Logo of ${name}`}
                        width={hero ? 200 : 100}
                        height={hero ? 200 : 100}
                        src={logo}
                        className={clsx([hero ? 'rounded-xl' : 'rounded-lg'])}
                    />
                </div>
                <div>
                    <h2 className="text-xl font-bold">{name}</h2>
                    <p className="pt-2">{description}</p>
                </div>
            </div>
            <div>
                {(to || toMore) && (
                    <div className="flex flex-row justify-end gap-8">
                        {toMore && (
                            <Button
                                onClick={() => {
                                    window.open(toMore, '_blank')
                                }}
                                variant="secondary"
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
                                className="animate-pulse"
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
                    <DeFiToolTile
                        data={tool}
                        hero={i == 0}
                        key={i}
                        className={clsx([i == 0 && 'col-span-2'])}
                    />
                ))}
            </div>
        </div>
    )
}
