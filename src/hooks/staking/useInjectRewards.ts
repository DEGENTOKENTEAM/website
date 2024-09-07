import abi from '@dappabis/stakex/abi-ui.json'
import { toLower } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Address, decodeEventLog } from 'viem'
import { usePublicClient, useSimulateContract, useWriteContract } from 'wagmi'

export const useInjectRewards = (
    address: Address,
    chainId: number,
    token: Address,
    amount: bigint,
    isEnabled: boolean
) => {
    const [logs, setLogs] = useState<any[]>()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const enabled = Boolean(isEnabled && address && chainId && token && amount)

    const {
        data,
        isError: isErrorSimulate,
        error: errorSimulate,
    } = useSimulateContract({
        address,
        abi,
        functionName: 'deposit',
        args: [token, amount],
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
        if (address && resetWriteContract && logs && logs.length > 0) {
            logs.forEach((log) => {
                const { data, topics } = log
                if (toLower(address) === toLower(log.address)) {
                    const event = decodeEventLog({ abi, data, topics })
                    if (event.eventName == 'Deposited') {
                        setIsLoading(false)
                        setIsSuccess(true)
                        resetWriteContract()
                    }
                }
            })
        }
    }, [logs, resetWriteContract, address])

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
