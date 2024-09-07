import abi from '@dappabis/stakex/abi-ui.json'
import { isUndefined } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Address, decodeEventLog } from 'viem'
import { usePublicClient, useSimulateContract, useWriteContract } from 'wagmi'

export const useUpdateFeesForStaking = (
    address: Address,
    chainId: number,
    feeStake: bigint,
    feeUnstake: bigint,
    feeRestake: bigint
) => {
    const [logs, setLogs] = useState<any[]>()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const enabled = Boolean(
        address &&
            chainId &&
            !isUndefined(feeStake) &&
            !isUndefined(feeUnstake) &&
            !isUndefined(feeRestake)
    )

    const {
        data,
        isError: isErrorSimulate,
        error: errorSimulate,
    } = useSimulateContract({
        address,
        abi,
        functionName: 'stakeXUpdateFeesForStaking',
        args: [feeStake, feeUnstake, feeRestake],
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
        if (!publicClient || !hash || !address) return
        publicClient
            .waitForTransactionReceipt({ hash })
            .then((receipt) => setLogs(receipt.logs))
            .catch((reason) => console.log('[ERROR]', { reason }))
    }, [publicClient, hash, address])

    useEffect(() => {
        if (resetWriteContract && logs && logs.length > 0) {
            logs.forEach((log) => {
                const { data, topics } = log
                const event = decodeEventLog({ abi, data, topics })
                if (event.eventName == 'UpdatedFeeForStaking') {
                    setIsLoading(false)
                    setIsSuccess(true)
                    resetWriteContract()
                }
            })
        }
    }, [logs, resetWriteContract])

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
