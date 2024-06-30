import { useEffect, useState } from 'react'

type useFetchType = {
    url: string
    method?: 'POST' | 'GET'
    body?: string
}

export const useFetches = (fetches: useFetchType[], enabled: boolean) => {
    const [response, setResponse] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal

        if (!enabled) return () => abortController.abort()

        const promises: Promise<Response>[] = []

        for (const { url, body, method } of fetches) {
            console.log(url)
            // promises.push(
            //     fetch(url, {
            //         method: method || 'GET',
            //         signal,
            //         headers: {
            //             Accept: 'application/json',
            //             'Content-Type': 'application/json',
            //         },
            //     })
            // )
        }

        Promise.all(promises)
            .then((res) => res.map((_res) => _res.json()))
            .then((data) => {
                if (!signal.aborted) {
                    setResponse(data)
                    setLoading(false)
                }
            })
            .catch((error) => console.warn('[useFetch Error]', error))

        return () => abortController.abort()
    }, [fetches])
    return { response, loading }
}
