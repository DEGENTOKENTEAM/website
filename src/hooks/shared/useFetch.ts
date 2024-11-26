import { isUndefined } from 'lodash'
import { useCallback, useEffect, useState } from 'react'

type useFetchType = {
    url: string
    method?: 'POST' | 'GET'
    body?: string
    enabled?: boolean
}
export const useFetch = <T = any>({
    url,
    method,
    body,
    enabled,
}: useFetchType) => {
    const [response, setResponse] = useState<T>()
    const [loading, setLoading] = useState(true)

    const _fetch = useCallback(() => {
        if (!isUndefined(enabled) && !enabled) return

        const abortController = new AbortController()
        const signal = abortController.signal

        fetch(url, {
            method: method || 'GET',
            signal,
            body: body || null,
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
    }, [url, method, body, enabled])

    useEffect(() => {
        url && _fetch && _fetch()
    }, [url, _fetch])

    return { response, loading, refetch: _fetch }
}
