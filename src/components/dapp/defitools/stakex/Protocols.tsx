import { Spinner } from '@dappelements/Spinner'
import { DAppContext } from '@dapphelpers/dapp'
import { useGetProtocols } from '@dapphooks/staking/useGetProtocols'
import { toLower } from 'lodash'
import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { chains } from 'shared/supportedChains'
import { ProtocolsResponse } from 'shared/types'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { RegularProtocolTile } from './protocols/RegularProtocolTile'

export const Protocols = () => {
    const { setTitle } = useContext(DAppContext)
    const [isLoading, setIsLoading] = useState(true)
    const { chain: chainAccount, address } = useAccount()
    let { chainId: _chainId } = useParams()
    const chainId = Number(_chainId)

    const isMyProtocols = location.pathname.includes('/account')

    const topProtocols = [toLower('0x00000000004545cB8440FDD6095a97DEBd1F3814') as Address]

    const chainIdsTestnet = chains.filter((chain) => chain.testnet).map((chain) => chain.id)
    const [showTestnets, setShowTestnets] = useState(false)

    const [protocols, setProtocols] = useState<ProtocolsResponse[]>()
    const [allProtocols, setAllProtocols] = useState<ProtocolsResponse[]>()
    const { response: responseProtocols, loading: loadingProtocols } = useGetProtocols({
        chainId,
        ...(isMyProtocols ? { account: address as Address } : {}),
    })

    useEffect(() => {
        if (!loadingProtocols && responseProtocols) {
            setAllProtocols(
                responseProtocols.map((p) => ({
                    ...p,
                    protocol: {
                        ...p.protocol,
                        stakedAbs: BigInt(p.protocol.stakedAbs),
                    },
                }))
            )
        }
    }, [loadingProtocols, responseProtocols])

    useEffect(() => {
        if (allProtocols)
            setProtocols(
                allProtocols
                    .map((p: any) => ({
                        ...p,
                        protocol: {
                            ...p.protocol,
                            stakedAbs: BigInt(p.protocol.stakedAbs),
                        },
                    }))
                    .filter((p: any) => !chainIdsTestnet.includes(p.protocol.chainId) || showTestnets)
                    .sort((left: any, right: any) => (left.protocol.apy.high > right.protocol.apy.high ? -1 : 1))
                    .sort((p: any) => (topProtocols.includes(toLower(p.protocol.source) as Address) ? -1 : 1))
            )
        else setProtocols([])
    }, [allProtocols, showTestnets])

    useEffect(() => {
        setShowTestnets(Boolean(chainAccount && chainAccount.testnet))
    }, [chainAccount])

    useEffect(() => {
        if (protocols) setIsLoading(false)
    }, [protocols])

    useEffect(() => {
        setTitle && setTitle(`STAKEX - ${isMyProtocols ? 'My ' : ''}Flexible Staking Pools`)
    }, [])

    return (
        <div className="mb-8 flex w-full max-w-5xl flex-col gap-8">
            <div className="flex flex-col gap-8 px-8 sm:flex-row sm:px-0">
                <h1 className="flex w-full flex-col items-start gap-1 font-title text-3xl font-bold tracking-wide sm:px-0 md:flex-row md:gap-4">
                    <span>
                        <span className="text-techGreen">STAKE</span>
                        <span className="text-degenOrange">X</span>
                    </span>
                    <span>{isMyProtocols && 'My '}Flexible Staking Pools</span>
                </h1>
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
                        <RegularProtocolTile key={protocol.source} protocolResponse={{ protocol, token }} />
                    ))}
            </div>
        </div>
    )
}
