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
    const [error, setError] = useState<string | null>(null)
    const [isError, setIsError] = useState(false)
    const [response, setResponse] = useState<RoutingsForTokenResponse>()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!enabled || !from || !tos || tos.length === 0 || !chainId) return

        setError(null)
        setIsError(false)

        const abortController = new AbortController()
        const signal = abortController.signal

        let hasError = false

        fetch(
            `${process.env.NEXT_PUBLIC_DEGENX_BACKEND_API_ENDPOINT}/api/uberrouting`,
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
            .then((res) => {
                if (res.status !== 200) hasError = true
                return res.json()
            })
            .then((res) => {
                setIsError(hasError)
                if (hasError) setError(res.message)
                if (!signal.aborted) {
                    setResponse(res)
                    setLoading(false)
                }
            })
            .catch((error) => console.warn('[useFetch Error]', error))

        return () => abortController.abort()
    }, [from, tos, chainId, enabled])

    return { isError, error, response, loading }
}
