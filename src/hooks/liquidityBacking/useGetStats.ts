import {
    readControllerContract,
    readVaultContract,
} from '@dapphelpers/liquidityBacking'
import { getTokenData } from '@dapphelpers/token'
import { useCallback, useEffect, useState } from 'react'
import { Address } from 'viem'

export const useGetStats = (chainId: number) => {
    const [vaultData, setVaultData] = useState<
        {
            tokenAddress: Address
            balance: bigint
            name: string
            symbol: string
            decimals: bigint
        }[]
    >()
    const [wantTokenData, setWantTokenData] = useState<
        {
            info: {
                name: string
                enabled: boolean
                isWantToken: boolean
            }
            address: Address
            decimals: bigint
        }[]
    >()
    const [isLoading, setIsLoading] = useState(false)
    const loadData = useCallback(async () => {
        const [countVaults, , , , countWantTokens]: [
            bigint,
            bigint,
            bigint,
            bigint,
            bigint
        ] = (await readControllerContract(chainId, {
            functionName: 'counts',
        })) as any

        {
            const data = (
                await Promise.all(
                    Array.from(Array(countVaults).keys()).map(async (index) => {
                        const vaultAddress: Address =
                            (await readControllerContract(chainId, {
                                functionName: 'allVaults',
                                args: [index],
                            })) as Address

                        const amountOfTokensInVault: bigint =
                            (await readVaultContract(chainId, {
                                address: vaultAddress,
                                functionName: 'countAssets',
                            })) as bigint

                        const tokensIndices = Array.from(
                            Array(Number(amountOfTokensInVault)).keys()
                        )

                        return await Promise.all(
                            tokensIndices.map(async (index) => {
                                const tokenAddress: Address =
                                    (await readVaultContract(chainId, {
                                        address: vaultAddress,
                                        functionName: 'allAssets',
                                        args: [index],
                                    })) as Address

                                const balance: bigint =
                                    (await readVaultContract(chainId, {
                                        address: vaultAddress,
                                        functionName: 'balanceOf',
                                        args: [tokenAddress],
                                    })) as bigint

                                return { tokenAddress, balance }
                            })
                        )
                    })
                )
            )
                .flat()
                .reduce((acc, val) => {
                    if (!acc[val.tokenAddress]) acc[val.tokenAddress] = 0n
                    acc[val.tokenAddress] += val.balance
                    return acc
                }, {} as Record<Address, bigint>)

            const dataIncNames = await Promise.all(
                Object.entries(data).map(async (tokenInfo) => {
                    const [name, symbol, decimals] = await getTokenData(
                        chainId,
                        tokenInfo[0] as Address
                    )

                    return {
                        tokenAddress: tokenInfo[0] as Address,
                        balance: tokenInfo[1],
                        name,
                        symbol,
                        decimals,
                    }
                })
            )

            setVaultData(dataIncNames)
        }

        {
            const data = (
                await Promise.all(
                    Array.from(Array(Number(countWantTokens)).keys()).map(
                        async (index) => {
                            const address = (await readControllerContract(
                                chainId,
                                { functionName: 'allWantTokens', args: [index] }
                            )) as Address

                            const info = (await readControllerContract(
                                chainId,
                                {
                                    functionName: 'wantTokens',
                                    args: [address],
                                }
                            )) as [string, boolean, boolean]

                            const [name, enabled, isWantToken] = info

                            const [_, __, decimals] = await getTokenData(
                                chainId,
                                address
                            )

                            return {
                                info: { name, enabled, isWantToken },
                                address,
                                decimals,
                            }
                        }
                    )
                )
            ).filter((token) => token.info.enabled)

            setWantTokenData(data)
        }

        setIsLoading(false)
    }, [chainId])

    useEffect(() => {
        if (!Boolean(loadData)) return
        setIsLoading(true)
        loadData()
    }, [loadData])

    return { data: { vaultData, wantTokenData }, loadData, isLoading }
}
