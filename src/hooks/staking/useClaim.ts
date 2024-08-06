import abi from '@dappabis/stakex/abi-ui.json'
import { useCallback, useEffect, useState } from 'react'
import { Address } from 'viem'
import {
    useBlockNumber,
    usePublicClient,
    useSimulateContract,
    useWriteContract,
} from 'wagmi'

export const useClaim = (
    address: Address,
    chainId: number,
    tokenId: bigint,
    target: Address,
    isEnabled: boolean
) => {
    const [logs, setLogs] = useState<any[]>()
    const [isLoading, setIsLoading] = useState<boolean>()
    const [rewardAmount, setRewardAmount] = useState<bigint>()

    const enabled =
        isEnabled && Boolean(address && chainId && tokenId && target)

    const {
        data,
        isError: isErrorSimulate,
        error: errorSimulate,
    } = useSimulateContract({
        address,
        chainId,
        abi,
        functionName: 'claim',
        args: [tokenId, target],
        query: {
            enabled,
        },
    })

    const {
        writeContract,
        data: hash,
        reset,
        error: errorWrite,
        isError: isErrorWrite,
    } = useWriteContract()

    const write = useCallback(() => {
        setIsLoading(true)
        data && writeContract && writeContract(data.request)
    }, [data, writeContract])

    const publicClient = usePublicClient({ chainId })

    const { data: dataBlockNumber } = useBlockNumber({
        watch: Boolean(isLoading),
    })

    useEffect(() => {
        if (publicClient && dataBlockNumber)
            publicClient
                .getContractEvents({
                    address,
                    abi,
                    args: {
                        tokenId,
                    },
                    eventName: 'Claimed',
                    fromBlock: dataBlockNumber - 1n,
                })
                .then((_logs) => setLogs(_logs))
                .catch((reason) => console.log('[ERROR]', { reason }))
    }, [publicClient, dataBlockNumber, address, tokenId])

    useEffect(() => {
        if (reset && hash && logs && logs.length > 0) {
            logs.forEach((log) => {
                if (hash && log.transactionHash == hash) {
                    setRewardAmount(log.args.reward.amount)
                    setIsLoading(false)
                    reset()
                }
            })
        }
    }, [logs, hash, reset])

    useEffect(() => {
        if (isErrorWrite) setIsLoading(false)
    }, [isErrorWrite])

    return {
        write,
        reset,
        error: errorSimulate || errorWrite,
        isError: isErrorSimulate || isErrorWrite,
        isLoading,
        isSuccess: Boolean(!isLoading && rewardAmount),
        rewardAmount,
        hash,
    }
}
