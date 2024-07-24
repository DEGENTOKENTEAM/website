import { useFetch } from '@dapphooks/shared/useFetch'
import { useEffect, useState } from 'react'
import { Address } from 'viem'

export type RouteRequest = { from: Address; tos: Address[]; chainId: number }

type useGetRoutingsForTokenType = RouteRequest & {
    enabled: boolean
}

type Token = {
    address: Address
    decimals: number
    name: string
    symbol: string
}
type DEX = {
    router: Address
    factory: Address
    reader: Address
    type: string
    name: string
}

export type RoutingsForTokenResponse = {
    fromToken: Token
    toToken: Token
    paths: { fromToken: Token; toToken: Token; dex: DEX }[]
}[]

export const useGetRoutingsForToken = ({
    enabled,
    from,
    tos,
    chainId,
}: useGetRoutingsForTokenType) => {
    const [response, setResponse] = useState<RoutingsForTokenResponse>()
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        if (!enabled || !from || !tos || tos.length === 0 || !chainId) return

        const abortController = new AbortController()
        const signal = abortController.signal

        fetch(
            `${process.env.NEXT_PUBLIC_DEGENX_BACKEND_API_ENDPOINT}/api/routing2`,
            {
                method: 'POST',
                signal,
                body: JSON.stringify({ from, tos, chainId }),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        )
            .then((res) => res.json())
            .then((res) => {
                if (!signal.aborted) {
                    setResponse(res)
                    setLoading(false)
                }
            })
            .catch((error) => console.warn('[useFetch Error]', error))

        return () => abortController.abort()
    }, [from, tos, chainId])

    return { response, loading }
}
