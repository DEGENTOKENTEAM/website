import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { useGetRewardTokens } from './useGetRewardTokens'

export const useGetTVLinUSD = (protocolAddress: Address) => {
    const [response, setResponse] = useState<number>(0)
    const [loading, setLoading] = useState(true)

    const { data: dataRewardTokens } = useGetRewardTokens(protocolAddress)

    // useEffect(() => {
    //     if (!dataRewardTokens || dataRewardTokens.length === 0) return

    //     const abortController = new AbortController()
    //     const signal = abortController.signal

    //     const dataFetches: Promise<Response>[] = []

    //     for (const rewardToken of dataRewardTokens) {
    //         dataFetches.push(
    //             fetch(
    //                 `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/latest/dex/tokens/${rewardToken.source}`,
    //                 {
    //                     method: 'GET',
    //                     signal,
    //                     headers: {
    //                         Accept: 'application/json',
    //                         'Content-Type': 'application/json',
    //                     },
    //                 }
    //             )
    //         )
    //     }

    //     Promise.all(dataFetches)
    //         .then((res) => Promise.all(res.map((_res) => _res.json())))
    //         .then((res) => {
    //             console.log(
    //                 Array.from(
    //                     Array(Number(dataRewardTokens.length)).keys()
    //                 ).reduce((acc, i) => {
    //                     const injected =
    //                         Number(dataRewardTokens[i].) /
    //                         10 ** Number(dataRewardTokens[i].decimals)
    //                     const filteredPairs = res[i].pairs.filter(
    //                         (pair: any) =>
    //                             pair.baseToken.address ===
    //                             dataRewardTokens[i].source
    //                     )
    //                     console.log(
    //                         injected,
    //                         filteredPairs.reduce(
    //                             (acc: number, { priceUsd }: any) => {
    //                                 return acc + Number(priceUsd)
    //                             },
    //                             0
    //                         ) / filteredPairs.length
    //                     )
    //                     // const usd = dataRewardTokens[i]
    //                     return acc
    //                 }, 0)
    //             )
    //             // dataRewardTokens.
    //             // res.
    //             // console.log(
    //             //     'dataRewardTokens',
    //             //     dataRewardTokens.map((rewardToken) => rewardToken.source)
    //             // )
    //             console.log({ res })
    //         })
    // }, [dataRewardTokens])

    // useEffect(() => {
    //     const abortController = new AbortController()
    //     const signal = abortController.signal

    //     if (!enabled) return () => abortController.abort()

    //     fetch(url, {
    //         method: method || 'GET',
    //         signal,
    //         headers: {
    //             Accept: 'application/json',
    //             'Content-Type': 'application/json',
    //         },
    //     })
    //         .then((res) => res.json())
    //         .then((data) => {
    //             if (!signal.aborted) {
    //                 setResponse(data)
    //                 setLoading(false)
    //             }
    //         })
    //         .catch((error) => console.warn('[useFetch Error]', error))

    //     return () => abortController.abort()
    // }, [url, method, body])
    return { response, loading }
}
