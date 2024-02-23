import { useCallback, useState } from 'react'

type VerificationPayloadData<T = any> = {
    keyToVerify: string
    addressToVerify: string
    signMessageData: T
}

export const useVerifyWallet = <T>() => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [response, setResponse] = useState(null)
    const _fetch = async ({
        addressToVerify,
        keyToVerify,
        signMessageData,
    }: VerificationPayloadData<T>) => {
        setIsLoading(true)
        try {
            const res = await fetch(
                process.env.NEXT_PUBLIC_BOUNCER_VERIFY_WALLET,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        key: keyToVerify,
                        wallet: addressToVerify,
                        signature: signMessageData,
                    }),
                }
            )
            const json = await res.json()
            if (res.status >= 500) setError(res.statusText)
            else setResponse(json)
        } catch (err) {
            setIsLoading(false)
            setError(err)
        } finally {
            setIsLoading(false)
        }
    }

    const request = useCallback((payload: VerificationPayloadData<T>) => {
        setError(null)
        _fetch(payload)
    }, [])

    return { isLoading, error, response, request }
}
