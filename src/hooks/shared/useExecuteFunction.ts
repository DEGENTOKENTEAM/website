import { toLower } from 'lodash'
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
}: useExecuteFunctionProps) => {
    const [logs, setLogs] = useState<any[]>()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        data,
        isError: isErrorSimulate,
        error: errorSimulate,
    } = useSimulateContract({
        address,
        chainId,
        abi,
        functionName,
        args,
        account: account || undefined,
        value: value || undefined,
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
                if (eventNames.indexOf(`${event.eventName}`) > -1) {
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
