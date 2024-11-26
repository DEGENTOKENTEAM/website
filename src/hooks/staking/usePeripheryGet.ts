import { useCallback, useEffect, useState } from 'react'
import { StakeXAPIPeripheryResponseType } from 'types/stakex'
import { Address, zeroAddress } from 'viem'

export const usePeripheryGet = (protocol: Address, chainId: number) => {
    const [response, setResponse] =
        useState<StakeXAPIPeripheryResponseType | null>(null)
    const [loading, setLoading] = useState(false)

    const load = useCallback(() => {
        if (!protocol || protocol == zeroAddress || !chainId) return

        setLoading(true)

        const abortController = new AbortController()
        const signal = abortController.signal

        fetch(
            `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/stakex/periphery/${chainId}/${protocol}`,
            {
                method: 'GET',
                signal,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (!signal.aborted) {
                    setResponse(data)
                    setLoading(false)
                }
            })
            .catch((error) => {
                console.warn('[useFetch Error]', error)
                setLoading(false)
            })

        return () => abortController.abort()
    }, [protocol, chainId])

    useEffect(() => {
        // initial call
        !loading && !response && protocol && chainId && load && load()
    }, [protocol, chainId, load, loading, response])

    return { response, loading, load }
}
