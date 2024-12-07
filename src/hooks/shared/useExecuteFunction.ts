import { isUndefined, toLower } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Address, decodeEventLog } from 'viem'
import { usePublicClient, useSimulateContract, useWriteContract } from 'wagmi'

type useExecuteFunctionProps = {
    address: Address
    chainId: number
    abi: any
    functionName: string
    args: any[]
    eventNames: string[]
    account?: Address
    value?: bigint
    enabled?: boolean
    onEvent?: (event: any) => void
    onEventMatch?: (event: any) => void
    onError?: (error: any) => void
}

export const useExecuteFunction = ({
    address,
    chainId,
    abi,
    functionName,
    args,
    eventNames,
    account,
    value,
    enabled,
    onEvent,
    onEventMatch,
    onError,
}: useExecuteFunctionProps) => {
    const [logs, setLogs] = useState<any[]>()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const _enabled = !isUndefined(enabled) ? enabled : true

    const simulateProps = useSimulateContract({
        address,
        chainId,
        abi,
        functionName,
        args,
        query: {
            enabled: Boolean(
                address && chainId && abi && functionName && _enabled
            ),
        },
        ...(account ? { account } : {}),
        ...(value && value > 0n ? { value } : {}),
    })
    const {
        data,
        isError: isErrorSimulate,
        error: errorSimulate,
        isLoading: isLoadingSimulate,
        isPending: isPendingSimulate,
        isSuccess: isSuccessSimulate,
    } = simulateProps

    const {
        writeContract,
        data: hash,
        reset: resetWriteContract,
        isPending,
        error: errorWrite,
        isError: isErrorWrite,
    } = useWriteContract()

    const write = () => setIsLoading(true)

    useEffect(() => {
        if (
            isLoading &&
            isSuccessSimulate &&
            data &&
            data.request &&
            writeContract
        )
            writeContract(data.request)
    }, [isLoading, isSuccessSimulate, data, writeContract])

    const reset = useCallback(() => {
        setLogs([])
        setIsSuccess(false)
        setIsLoading(false)
        resetWriteContract && resetWriteContract()
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
        if (eventNames && eventNames.length && logs && logs.length) {
            logs.filter(
                (log) => toLower(address) === toLower(log.address)
            ).forEach((log) => {
                const event = decodeEventLog({
                    abi,
                    data: log.data,
                    topics: log.topics,
                }) as any
                // event callback
                onEvent && onEvent(event)
                if (eventNames.indexOf(`${event.eventName}`) > -1) {
                    onEventMatch && onEventMatch(event)
                    setIsLoading(false)
                    setIsSuccess(true)
                    // resetWriteContract()
                }
            })
        } else if (!eventNames.length && logs && logs.length > 0) {
            setIsLoading(false)
            setIsSuccess(true)
        }
    }, [logs, eventNames, abi, address])

    useEffect(() => {
        if (isErrorWrite && errorWrite) {
            setIsLoading(false)
            onError && onError(errorWrite)
        }
    }, [isErrorWrite, errorWrite])

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
        logs,
    }
}
