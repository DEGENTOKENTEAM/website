import { useState } from 'react'
import { StakeXAPIPeripheryUpdateDTO } from 'types/stakex'

export const usePeripheryUpdate = () => {
    const [response, setResponse] = useState<any>(null)
    const [error, setError] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const update = (body: StakeXAPIPeripheryUpdateDTO) => {
        const abortController = new AbortController()
        const signal = abortController.signal

        if (loading) return

        setLoading(true)

        fetch(
            `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/stakex/periphery/update`,
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
                if (!signal.aborted) {
                    setResponse(data)
                    setLoading(false)
                } else {
                    setError('Request canceled')
                }
            })
            .catch((error) => {
                setError(error)
                console.warn('[useFetch Error]', error)
            })

        if (signal.aborted) return () => abortController.abort()
    }

    return { update, response, loading, error }
}
