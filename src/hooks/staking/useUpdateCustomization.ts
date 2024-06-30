import { useState } from 'react'
import { StakeXCustomizationDTO } from 'types/stakex'

export const useUpdateCustomization = () => {
    const [response, setResponse] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const update = (body: StakeXCustomizationDTO) => {
        const abortController = new AbortController()
        const signal = abortController.signal

        if (loading) return

        setLoading(true)

        fetch(
            `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/ipfs/stakex/customization/update`,
            {
                method: 'POST',
                signal,
                body: JSON.stringify(body),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                console.log('[useUpdateCustomization]', { data })
                if (!signal.aborted) {
                    setResponse(data)
                    setLoading(false)
                }
            })
            .catch((error) => console.warn('[useFetch Error]', error))

        return () => abortController.abort()
    }

    return { update, response, loading }
}
