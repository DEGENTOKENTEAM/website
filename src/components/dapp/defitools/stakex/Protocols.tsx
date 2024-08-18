import { DAppContext } from '@dapphelpers/dapp'
import { CaretDivider } from '@dappshared/CaretDivider'
import { Tile } from '@dappshared/Tile'
import { useCallback, useContext, useEffect, useState } from 'react'
import { ProtocolsResponse } from 'shared/types'
import { Address } from 'viem'
import { StakingProjectLogo } from '../../staking/StakingProjectLogo'
import { toReadableNumber } from '@dapphelpers/number'
import { Button } from 'src/components/Button'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@dappelements/Spinner'

export const Protocols = () => {
    const { setTitle } = useContext(DAppContext)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()
    const [topProtocols, setTopProtocols] = useState<Address[]>([
        '0x00000000004545cB8440FDD6095a97DEBd1F3814',
    ])

    const [selectedChain, setSelectedChain] = useState<number>() // set default chain until we expand on additional networks

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
                    res.map((p: any) => ({
                        ...p,
                        protocol: {
                            ...p.protocol,
                            stakedAbs: BigInt(p.protocol.stakedAbs),
                        },
                    }))
                )
            })
    }, [selectedChain])

    useEffect(() => {
        setTitle('Overview STAKEX protocols')
        loadProtocols()
    }, [])

    useEffect(() => {
        if (protocols) setIsLoading(false)
    }, [protocols])

    return (
        <div className="mb-8 flex w-full max-w-5xl flex-col gap-8">
            <h1 className="flex w-full max-w-2xl flex-row items-end gap-1 px-8 font-title text-3xl font-bold tracking-wide sm:px-0">
                <span className="text-techGreen">STAKE</span>
                <span className="text-degenOrange">X</span>
                <span className="text-xl">Protocols</span>
            </h1>
            {isLoading && (
                <div className="flex w-full items-center justify-center">
                    <Spinner theme="dark" />
                </div>
            )}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {!isLoading &&
                    protocols &&
                    protocols.map(({ protocol, token }) => (
                        <Tile
                            key={protocol.source}
                            className="flex w-full flex-col gap-6"
                        >
                            <StakingProjectLogo
                                projectName={protocol.name}
                                source={protocol.logo}
                                isLite={true}
                            />
                            <CaretDivider color="cyan" />
                            <div className="mt-1 grid grid-cols-2 gap-x-1 gap-y-1">
                                <div>Token:</div>
                                <div>{token.symbol}</div>

                                <div>Staked:</div>
                                <div>
                                    {toReadableNumber(
                                        protocol.stakedAbs,
                                        token.decimals,
                                        {
                                            maximumFractionDigits: 2,
                                            minimumFractionDigits: 2,
                                        }
                                    )}
                                    <br />(
                                    {toReadableNumber(protocol.stakedRel, 0, {
                                        maximumFractionDigits: 2,
                                        minimumFractionDigits: 2,
                                    })}
                                    % of total supply)
                                </div>

                                <div>Stakes:</div>
                                <div>{protocol.stakes}</div>

                                <div>APR:</div>
                                <div>
                                    {toReadableNumber(protocol.apr.high, 0, {
                                        maximumFractionDigits: 4,
                                        minimumFractionDigits: 2,
                                    })}
                                    %
                                </div>

                                <div>APY:</div>
                                <div>
                                    {toReadableNumber(protocol.apy.high, 0, {
                                        maximumFractionDigits: 4,
                                        minimumFractionDigits: 2,
                                    })}
                                    %
                                </div>
                            </div>
                            <Button
                                className=""
                                onClick={() => {
                                    navigate(
                                        `manage/${protocol.chainId}/${protocol.source}`,
                                        { relative: 'route' }
                                    )
                                }}
                                variant="primary"
                            >
                                Details
                            </Button>
                        </Tile>
                    ))}
            </div>
        </div>
    )
}
