import Image from 'next/image'
import { PropsWithChildren } from 'react'
import { Button } from '../../Button'
import { useNavigate } from 'react-router-dom'

type DeFiToolType = {
    name: string
    logo: any
    to: string | null
    toMore: string | null
    description: string | null
}

const defitools: DeFiToolType[] = [
    {
        name: 'STAKEX',
        logo: '/defitools/dummy-defitools-logo.png',
        to: './stakex/create',
        toMore: 'https://docs.dgnx.finance/degenx-ecosystem/Products/stakex/introduction',
        description:
            'STAKEX is an audited staking protocol providing a new staking methodology, powered by the DEGENX Ecosystem. It&apos;s a deployable protocol for projects based on EVM networks like Ethereum, Binance Smart Chain, Base, Arbitrum, Avalanche, and more.',
    },
    {
        name: 'LIQUIDITY BACKING',
        logo: '/defitools/dummy-defitools-logo.png',
        to: null,
        toMore: 'https://docs.dgnx.finance/degenx-ecosystem/Products/Liquidity_Backing/liquidity_backing',
        description:
            'Liquidity Backing is setting a foundational value for your project by establishing a growing pool of assets based on your total supply. This mechanism allows your holders to unlock their share of Liquidity Backing assets by choosing to burn their tokens.',
    },
    {
        name: 'LOCKER',
        logo: '/defitools/dummy-defitools-logo.png',
        to: null,
        toMore: null,
        description: 'TBD',
    },
    {
        name: 'DISBURSER',
        logo: '/defitools/dummy-defitools-logo.png',
        to: null,
        toMore: null,
        description: 'TBD',
    },
]

const DeFiToolTile = ({ children }: PropsWithChildren) => <div>{children}</div>
const DeFiToolTileLogo = ({ children }: PropsWithChildren) => (
    <div>{children}</div>
)
const DeFiToolTileHeadline = ({ children }: PropsWithChildren) => (
    <div>{children}</div>
)
const DeFiToolTileDescription = ({ children }: PropsWithChildren) => (
    <div>{children}</div>
)

export const DeFiToolsOverview = () => {
    const navigate = useNavigate()
    return (
        <div>
            {defitools.map(({ logo, name, description, to, toMore }) => (
                <DeFiToolTile>
                    <DeFiToolTileLogo>
                        <Image
                            alt={`Logo of ${name}`}
                            width={100}
                            height={100}
                            src={logo}
                        />
                    </DeFiToolTileLogo>
                    <DeFiToolTileHeadline>{name}</DeFiToolTileHeadline>
                    <DeFiToolTileDescription>
                        {description}
                    </DeFiToolTileDescription>
                    {(to || toMore) && (
                        <div className="flex flex-row">
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
                            <div className="flex-grow"></div>
                            {to && (
                                <Button
                                    onClick={() => {
                                        navigate(to)
                                    }}
                                    variant="primary"
                                >
                                    Create
                                </Button>
                            )}
                        </div>
                    )}
                </DeFiToolTile>
            ))}
        </div>
    )
}
