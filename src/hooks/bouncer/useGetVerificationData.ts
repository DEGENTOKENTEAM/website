import { useCallback, useEffect, useState } from 'react'

export type GetVerificationDataResponseItem = {
    wallet: string
    verified: boolean
    verifyMessage: string
    amount: number
    network: 'evm' | 'sol'
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
): [GetVerificationDataResponse, Function] => {
    const [data, setData] = useState<GetVerificationDataResponse>(null)
    useEffect(() => {
        loadData()
    }, [hash])
    const _loadData = async (_hash: string) => {
        if (!_hash) return
        fetch(
            process.env.NEXT_PUBLIC_BOUNCER_VERIFICATION_DATA.replace(
                '{hash}',
                _hash
            )
        )
            .then((res) => res.json())
            .then((res) => setData(res))
    }
    const loadData = useCallback(() => {
        _loadData(hash)
    }, [])
    return [data, loadData]
}
