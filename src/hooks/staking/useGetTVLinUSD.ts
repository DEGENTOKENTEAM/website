import erc20Abi from '@dappabis/erc20.json'
import { TokenInfoResponse } from '@dapptypes'
import { isNaN } from 'lodash'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { usePublicClient } from 'wagmi'
import { useTokensGetTokens } from './useTokensGetTokens'

export const useGetTVLinUSD = (protocolAddress: Address, chainId: number) => {
    const [response, setResponse] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const client = usePublicClient({ chainId })

    const [dataFetchesResults, setDataFetchesResult] = useState<any>()
    const [balanceFetchesResults, setBalanceFetchesResults] = useState<any>()
    const [isComplete, setIsComplete] = useState(true)
    const [tokens, setTokens] = useState<TokenInfoResponse[]>()

    const { data: dataGetTokens } = useTokensGetTokens(
        protocolAddress,
        chainId!
    )

    useEffect(() => {
        if (!client || !protocolAddress || !tokens || tokens.length === 0)
            return

        const abortController = new AbortController()
        const signal = abortController.signal

        const dataFetches: Promise<Response>[] = []
        const balanceFetches: Promise<bigint>[] = []

        for (const token of tokens) {
            if (!token.isReward) continue
            dataFetches.push(
                fetch(
                    `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/latest/dex/tokens/${token.source}`,
                    {
                        method: 'GET',
                        signal,
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                    }
                )
            )

            balanceFetches.push(
                client.readContract({
                    address: token.source,
                    abi: erc20Abi,
                    functionName: 'balanceOf',
                    args: [protocolAddress],
                }) as Promise<bigint>
            )
        }

        Promise.all(dataFetches)
            .then((res) => Promise.all(res.map((_res) => _res.json())))
            .then(setDataFetchesResult)

        Promise.all(balanceFetches).then(setBalanceFetchesResults)

        if (signal.aborted) return () => abortController.abort()
    }, [client, tokens, protocolAddress])

    useEffect(() => {
        dataGetTokens &&
            dataGetTokens.length > 0 &&
            setTokens(dataGetTokens.filter((token) => token.isReward))
    }, [dataGetTokens])

    useEffect(() => {
        if (
            !tokens ||
            !balanceFetchesResults ||
            !dataFetchesResults ||
            tokens.length +
                balanceFetchesResults.length +
                dataFetchesResults.length !==
                tokens.length * 3
        )
            return

        setResponse(
            tokens.reduce((acc: number, rewardToken, idx) => {
                if (balanceFetchesResults[idx] > 0n) {
                    const balance =
                        Number(balanceFetchesResults[idx]) /
                        10 ** Number(rewardToken.decimals)

                    if (!dataFetchesResults[idx]) {
                        setIsComplete(false)
                        return isNaN(acc) ? 0 : acc
                    }

                    const { pairs } = dataFetchesResults[idx]

                    if (!pairs) {
                        setIsComplete(false)
                        return isNaN(acc) ? 0 : acc
                    }

                    const filteredPairs = pairs?.filter(
                        ({ baseToken: { address } }) =>
                            rewardToken.source == address
                    )
                    const avgUSD =
                        filteredPairs?.reduce((acc: number, { priceUsd }) => {
                            return acc + Number(priceUsd)
                        }, 0) / filteredPairs?.length
                    return acc + balance * avgUSD
                }
                return isNaN(acc) ? 0 : acc
            }, 0)
        )
        setLoading(false)
    }, [tokens, balanceFetchesResults, dataFetchesResults])

    return { response, loading, isComplete }
}
