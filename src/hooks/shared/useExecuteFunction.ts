import { toLower } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Address, decodeEventLog } from 'viem'
import { usePublicClient, useSimulateContract, useWriteContract } from 'wagmi'

export const useExecuteFunction = (
    address: Address,
    chainId: number,
    abi: any,
    functionName: string,
    args: any[],
    eventNames: string[],
    enabled?: boolean
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
        functionName,
        args,
        query: {
            enabled: Boolean(
                address && chainId && abi && functionName && enabled
            ),
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
        setIsSuccess(false)
        resetWriteContract && resetWriteContract()
    }, [resetWriteContract])

    const publicClient = usePublicClient({ chainId })

    useEffect(() => {
        if (!publicClient || !hash || !address) return
        publicClient
            .getTransactionReceipt({ hash })
            .then((receipt) => setLogs(receipt.logs))
            .catch((reason) => console.log('[ERROR]', { reason }))
    }, [publicClient, hash, address])

    useEffect(() => {
        if (eventNames && logs && logs.length > 0) {
            logs.filter(
                (log) => toLower(address) === toLower(log.address)
            ).forEach((log) => {
                const event = decodeEventLog({
                    abi,
                    data: log.data,
                    topics: log.topics,
                }) as any
                if (eventNames.indexOf(`${event.eventName}`) > -1) {
                    setIsLoading(false)
                    setIsSuccess(true)
                    // resetWriteContract()
                }
            })
        }
    }, [logs, eventNames])

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
