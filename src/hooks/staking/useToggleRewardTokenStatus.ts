import abi from '@dappabis/stakex/abi-ui.json'
import { isBoolean } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Address, decodeEventLog } from 'viem'
import { usePublicClient, useSimulateContract, useWriteContract } from 'wagmi'

export const useToggleRewardTokenStatus = (
    chainId: number,
    address: Address,
    manager: Address
) => {
    const [logs, setLogs] = useState<any[]>()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const [token, setToken] = useState<Address | null>(null)
    const [status, setStatus] = useState<boolean | null>(null)

    const {
        data,
        isError: isErrorSimulate,
        error: errorSimulate,
    } = useSimulateContract({
        address,
        abi,
        functionName: 'stakeXEnableRewardToken',
        args: [token, status],
        query: {
            enabled: Boolean(token) && isBoolean(status),
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

    const write = (_token: Address, _status: boolean) => {
        setIsLoading(true)
        setToken(_token)
        setStatus(_status)
    }

    const reset = useCallback(() => {
        if (!resetWriteContract) return
        setIsSuccess(false)
        resetWriteContract()
    }, [resetWriteContract])

    const publicClient = usePublicClient({ chainId })

    useEffect(() => {
        isBoolean(status) &&
            token &&
            data &&
            writeContract &&
            writeContract(data.request)
    }, [data, writeContract, token, status])

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
                if (
                    event.eventName == 'EnabledRewardToken' ||
                    event.eventName == 'DisabledRewardToken'
                ) {
                    setIsLoading(false)
                    setIsSuccess(true)
                    setToken(null)
                    setStatus(null)
                    resetWriteContract()
                }
            })
        }
    }, [logs])

    useEffect(() => {
        if (isErrorSimulate || isErrorWrite) {
            setIsLoading(false)
            setToken(null)
            setStatus(null)
        }
    }, [isErrorSimulate, isErrorWrite])

    return {
        token,
        write,
        reset,
        error: errorSimulate || errorWrite,
        isError: isErrorSimulate || isErrorWrite,
        isLoading,
        isSuccess,
        isPending,
        isEnabled: Boolean(token),
        hash,
    }
}
