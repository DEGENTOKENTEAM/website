import { Spinner } from '@dappelements/Spinner'
import { DAppContext } from '@dapphelpers/dapp'
import { toReadableNumber } from '@dapphelpers/number'
import { CaretDivider } from '@dappshared/CaretDivider'
import { Tile } from '@dappshared/Tile'
import { toLower } from 'lodash'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getChainById } from 'shared/supportedChains'
import { ProtocolsResponse } from 'shared/types'
import { Button } from 'src/components/Button'
import { Address } from 'viem'
import { StakingProjectLogo } from '../../staking/StakingProjectLogo'

export const Protocols = () => {
    const { setTitle } = useContext(DAppContext)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()
    let { chainId } = useParams()
    const [topProtocols, setTopProtocols] = useState<Address[]>([
        toLower('0x00000000004545cB8440FDD6095a97DEBd1F3814') as Address,
    ])

    const [selectedChain, setSelectedChain] = useState<number>(Number(chainId)) // set default chain until we expand on additional networks

    const [protocols, setProtocols] = useState<ProtocolsResponse[]>()

    const loadProtocols = useCallback(() => {
        fetch(
            selectedChain
                ? `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/stakex/protocols/${selectedChain}`
                : `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/stakex/protocols`
        )
            .then((res) => res.json())
            .then((res) => {
                setProtocols(
                    res
                        .map((p: any) => ({
                            ...p,
                            protocol: {
                                ...p.protocol,
                                stakedAbs: BigInt(p.protocol.stakedAbs),
                            },
                        }))
                        .sort((left: any, right: any) => (left.protocol.apy.high > right.protocol.apy.high ? -1 : 1))
                        .sort((p: any) => (topProtocols.includes(toLower(p.protocol.source) as Address) ? -1 : 1))
                )
            })
    }, [selectedChain, topProtocols])

    useEffect(() => {
        setTitle && setTitle('Overview STAKEX protocols')
        if (!protocols && loadProtocols) loadProtocols()
    }, [setTitle, loadProtocols, protocols])

    useEffect(() => {
        if (protocols) setIsLoading(false)
    }, [protocols])

    return (
        <div className="mb-8 flex w-full max-w-5xl flex-col gap-8">
            <div className="flex flex-col gap-8 px-8 sm:flex-row sm:px-0">
                <h1 className="flex w-full flex-grow flex-row items-end font-title text-3xl font-bold tracking-wide sm:px-0">
                    <span className="text-techGreen">STAKE</span>
                    <span className="text-degenOrange">X</span>
                    <span className="ml-1 text-xl">Overview</span>
                </h1>
                <Button
                    onClick={() => {
                        navigate('./create/', { relative: 'route' })
                    }}
                    variant="primary"
                    className="h-16 animate-pulse whitespace-nowrap text-xl sm:h-full sm:text-base"
                >
                    Create Your Staking Solution
                </Button>
            </div>
            {isLoading && (
                <div className="flex w-full items-center justify-center">
                    <Spinner theme="dark" />
                </div>
            )}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {!isLoading &&
                    protocols &&
                    protocols.map(({ protocol, token }) => (
                        <Tile key={protocol.source} className="flex w-full flex-col gap-6">
                            <div className="flex flex-row items-center">
                                <StakingProjectLogo
                                    projectName={protocol.name}
                                    source={protocol.logo}
                                    hideChain={Boolean(selectedChain && selectedChain == protocol.chainId)}
                                    chain={getChainById(protocol.chainId)}
                                    isLite={true}
                                    className="flex-grow"
                                />
                                <span
                                    className={`flex h-5 min-h-0 items-center gap-2 rounded-lg bg-opacity-30 px-2 py-1 font-display text-xs leading-3 ${
                                        protocol.isRunning ? 'bg-success' : 'bg-error'
                                    }`}
                                >
                                    <svg width={8} height={8} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                        <circle
                                            className={protocol.isRunning ? 'fill-success' : 'fill-error'}
                                            cx="50"
                                            cy="50"
                                            r="50"
                                        />
                                    </svg>
                                    <span className="text-dapp-cyan-50 text-opacity-60">
                                        {protocol.isRunning ? 'Online' : 'Offline'}
                                    </span>
                                </span>
                            </div>
                            <CaretDivider color="cyan" />
                            <div className="mt-1 flex flex-col gap-2">
                                <div>
                                    <span className="mr-2 font-bold">Token</span> {token.symbol}
                                </div>

                                <div>
                                    <span className="mr-2 font-bold">Staked</span>{' '}
                                    {toReadableNumber(protocol.stakedAbs, token.decimals, {
                                        maximumFractionDigits: 2,
                                        minimumFractionDigits: 2,
                                    })}{' '}
                                    (
                                    {toReadableNumber(protocol.stakedRel, 0, {
                                        maximumFractionDigits: 2,
                                        minimumFractionDigits: 2,
                                    })}
                                    % of total supply)
                                </div>

                                <div>
                                    <span className="mr-2 font-bold">Stakers</span> {protocol.stakes}
                                </div>

                                <div>
                                    <span className="mr-2 font-bold">APR</span>{' '}
                                    {toReadableNumber(protocol.apr.high, 0, {
                                        maximumFractionDigits: 4,
                                        minimumFractionDigits: 2,
                                    })}
                                    %
                                </div>

                                <div>
                                    <span className="mr-2 font-bold">APY</span>{' '}
                                    {toReadableNumber(protocol.apy.high, 0, {
                                        maximumFractionDigits: 4,
                                        minimumFractionDigits: 2,
                                    })}
                                    %
                                </div>
                                <div>
                                    <span className="mr-2 font-bold">Network</span>{' '}
                                    {getChainById(protocol.chainId).name} (ID: {protocol.chainId})
                                </div>
                            </div>
                            <div className="flex h-16 w-full flex-row gap-8 sm:h-auto">
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        navigate(`manage/${protocol.chainId}/${protocol.source}`, { relative: 'route' })
                                    }}
                                    variant="primary"
                                >
                                    Details
                                </Button>
                                <Button
                                    className="w-full"
                                    disabled={!protocol.isRunning}
                                    onClick={() => {
                                        navigate(`/dapp/staking/${protocol.chainId}/${protocol.source}`, {
                                            relative: 'path',
                                        })
                                    }}
                                    variant="primary"
                                >
                                    Stake {token.symbol}
                                </Button>
                            </div>
                        </Tile>
                    ))}
            </div>
        </div>
    )
}
