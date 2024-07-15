import erc20Abi from '@dappabis/erc20.json'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { usePublicClient } from 'wagmi'
import { useGetRewardTokens } from './useGetRewardTokens'

export const useGetTVLinUSD = (
    chainId: number | undefined,
    protocolAddress: Address
) => {
    const [response, setResponse] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const client = usePublicClient({ chainId })

    const [dataFetchesResults, setDataFetchesResult] = useState<any>()
    const [balanceFetchesResults, setBalanceFetchesResults] = useState<any>()

    const { data: dataRewardTokens } = useGetRewardTokens(
        protocolAddress,
        chainId!
    )

    useEffect(() => {
        if (!client || !dataRewardTokens || dataRewardTokens.length === 0)
            return

        const abortController = new AbortController()
        const signal = abortController.signal

        const dataFetches: Promise<Response>[] = []
        const balanceFetches: Promise<bigint>[] = []

        for (const rewardToken of dataRewardTokens) {
            dataFetches.push(
                fetch(
                    `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/latest/dex/tokens/${rewardToken.source}`,
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
                    address: rewardToken.source,
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
    }, [client, dataRewardTokens])

    useEffect(() => {
        if (!dataRewardTokens || !balanceFetchesResults || !dataFetchesResults)
            return

        setResponse(
            dataRewardTokens.reduce((acc: number, rewardToken, idx) => {
                if (balanceFetchesResults[idx] > 0n) {
                    const balance =
                        Number(balanceFetchesResults[idx]) /
                        10 ** Number(rewardToken.decimals)

                    const { pairs } = dataFetchesResults[idx]
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
                return acc
            }, 0)
        )
        setLoading(false)
    }, [dataRewardTokens, balanceFetchesResults, dataFetchesResults])

    return { response, loading }
}
