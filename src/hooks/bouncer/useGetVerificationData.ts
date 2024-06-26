import { useCallback, useEffect, useState } from 'react'

export type GetVerificationDataResponseItem = {
    wallet: string
    verified: boolean
    verifyMessage: string
    amount: number
}
export type GetVerificationDataResponse = {
    status: string
    message?: string
    data?: {
        key: string
        totalAmount: number
        items: GetVerificationDataResponseItem[]
        verificationFinished: boolean
    }
}

export const useGetVerificationData = (
    hash: string
): [GetVerificationDataResponse | null, Function] => {
    const [data, setData] = useState<GetVerificationDataResponse | null>(null)
    const loadData = useCallback(() => {
        fetch(
            process.env.NEXT_PUBLIC_BOUNCER_VERIFICATION_DATA!.replace(
                '{hash}',
                hash
            )
        )
            .then((res) => res.json())
            .then((res) => setData(res))
    }, [hash])
    useEffect(() => {
        if (!hash) return
        loadData()
    }, [loadData, hash])
    return [data, loadData]
}
