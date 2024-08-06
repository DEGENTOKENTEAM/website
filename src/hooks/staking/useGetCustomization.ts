import { useCallback, useEffect, useState } from 'react'
import { StakeXCustomizationResponseType } from 'types/stakex'
import { Address, getAddress, zeroAddress } from 'viem'

export const useGetCustomization = (protocolAddress: Address) => {
    const [response, setResponse] =
        useState<StakeXCustomizationResponseType | null>(null)
    const [loading, setLoading] = useState(false)

    const load = useCallback(() => {
        const abortController = new AbortController()
        const signal = abortController.signal

        if (loading || protocolAddress == zeroAddress) return

        setLoading(true)

        fetch(
            `${
                process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT
            }/ipfs/stakex/customization/fetch/${getAddress(protocolAddress)}`,
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
    }, [protocolAddress])

    useEffect(() => {
        load()
    }, [protocolAddress])

    return { response, loading, load }
}
