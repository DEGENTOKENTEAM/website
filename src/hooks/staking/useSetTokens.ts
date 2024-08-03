import abi from '@dappabis/stakex/abi-ui.json'
import { SetTargetTokenParams } from '@dapptypes'
import { useCallback, useEffect, useState } from 'react'
import { Address, decodeEventLog } from 'viem'
import { usePublicClient, useSimulateContract, useWriteContract } from 'wagmi'

export const useSetTokens = (
    enabled: boolean,
    chainId: number,
    address: Address,
    manager: Address,
    params: SetTargetTokenParams,
    isReward: boolean
) => {
    const [logs, setLogs] = useState<any[]>()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        data,
        isError: isErrorSimulate,
        error: errorSimulate,
    } = useSimulateContract({
        address,
        abi,
        functionName: isReward
            ? 'stakeXAddRewardAndTargetToken'
            : 'stakeXSetTargetToken',
        args: [params],
        query: {
            enabled,
        },
    })

    const {
        writeContract,
        data: hash,
        reset: resetWriteContract,
        isPending,
        error: errorWrite,
        isError: isErrorWrite,
    } = useWriteContract()

    const write = useCallback(() => {
        setIsLoading(true)
        data && writeContract && writeContract(data.request)
    }, [data, writeContract])

    const reset = useCallback(() => {
        if (!resetWriteContract) return
        setIsSuccess(false)
        resetWriteContract()
    }, [resetWriteContract])

    const publicClient = usePublicClient({ chainId })

    useEffect(() => {
        if (!publicClient || !hash || !manager || !address) return
        publicClient
            .getTransactionReceipt({ hash })
            .then((receipt) => setLogs(receipt.logs))
            .catch((reason) => console.log('[ERROR]', { reason }))
    }, [publicClient, hash, address, manager])

    useEffect(() => {
        if (logs && logs.length > 0) {
            logs.forEach((log) => {
                const { data, topics } = log
                const event = decodeEventLog({ abi, data, topics })
                if (event.eventName == 'SetTargetToken') {
                    setIsLoading(false)
                    setIsSuccess(true)
                    resetWriteContract()
                }
            })
        }
    }, [logs])

    useEffect(() => {
        if (isErrorWrite) setIsLoading(false)
    }, [isErrorWrite])

    return {
        write,
        reset,
        error: errorSimulate || errorWrite,
        isError: isErrorSimulate || isErrorWrite,
        isLoading,
        isSuccess,
        isPending,
        isEnabled: enabled,
        hash,
    }
}
