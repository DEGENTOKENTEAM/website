import abi from '@dappabis/stakex/abi-ui.json'
import { isBoolean } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Address, decodeEventLog } from 'viem'
import { usePublicClient, useSimulateContract, useWriteContract } from 'wagmi'

export const useEnableProtocol = (
    address: Address,
    chainId: number,
    status: boolean,
    enabled: boolean
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
        functionName: 'stakeXEnableProtocol',
        args: [status],
        query: {
            enabled: Boolean(
                address && chainId && isBoolean(status) && enabled
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
        if (!resetWriteContract) return
        setIsSuccess(false)
        resetWriteContract()
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
        if (resetWriteContract && logs && logs.length > 0) {
            logs.forEach((log) => {
                const { data, topics } = log
                const event = decodeEventLog({ abi, data, topics })
                if (
                    event.eventName == 'Enabled' ||
                    event.eventName == 'Disabled'
                ) {
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
