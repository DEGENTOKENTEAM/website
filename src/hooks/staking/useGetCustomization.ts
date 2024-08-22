import { useCallback, useEffect, useState } from 'react'
import { StakeXCustomizationResponseType } from 'types/stakex'
import { Address, zeroAddress } from 'viem'

export const useGetCustomization = (protocol: Address, chainId: number) => {
    const [response, setResponse] =
        useState<StakeXCustomizationResponseType | null>(null)
    const [loading, setLoading] = useState(false)

    const load = useCallback(() => {
        const abortController = new AbortController()
        const signal = abortController.signal

        if (loading || protocol == zeroAddress || !chainId) return

        setLoading(true)

        fetch(
            `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/ipfs/stakex/customization/fetch/${chainId}/${protocol}`,
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
        load()
    }, [protocol, chainId])

    return { response, loading, load }
}
