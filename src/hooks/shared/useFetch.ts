import { useEffect, useState } from 'react'

type useFetchType = {
    url: string
    method?: 'POST' | 'GET'
    body?: string
    enabled?: boolean
}
export const useFetch = ({ url, method, body, enabled }: useFetchType) => {
    const [response, setResponse] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal

        if (!enabled) return () => abortController.abort()

        fetch(url, {
            method: method || 'GET',
            signal,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (!signal.aborted) {
                    setResponse(data)
                    setLoading(false)
                }
            })
            .catch((error) => console.warn('[useFetch Error]', error))

        return () => abortController.abort()
    }, [url, method, body])
    return { response, loading }
}
