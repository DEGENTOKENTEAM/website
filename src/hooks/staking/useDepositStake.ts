import abi from '@dappabis/stakex/abi-ui.json'
import { useCallback, useEffect, useState } from 'react'
import { Address } from 'viem'
import {
    useBlockNumber,
    usePublicClient,
    useSimulateContract,
    useWriteContract,
} from 'wagmi'

export const useDepositStake = (
    address: Address,
    chainId: number,
    stakeBucketId: Address,
    amount: bigint,
    isEnabled: boolean
) => {
    const [logs, setLogs] = useState<any[]>()
    const [isLoading, setIsLoading] = useState<boolean>()
    const [feeAmount, setFeeAmount] = useState<bigint>()
    const [stakeAmount, setStakeAmount] = useState<bigint>()

    const enabled = Boolean(
        isEnabled && stakeBucketId && amount && address && chainId
    )

    const _simulate = useSimulateContract({
        address,
        abi,
        chainId,
        functionName: 'stake',
        args: [stakeBucketId, amount],
        query: {
            enabled,
        },
    })

    const {
        data,
        isError: isErrorSimulate,
        error: errorSimulate,
        isPending: isPendingSimulation,
        isSuccess: isSuccessSimulation,
    } = _simulate

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

    const publicClient = usePublicClient()

    const { data: dataBlockNumber } = useBlockNumber({
        watch: Boolean(isLoading),
    })

    useEffect(() => {
        if (publicClient && dataBlockNumber)
            publicClient
                .getContractEvents({
                    address,
                    abi,
                    eventName: 'Staked',
                    fromBlock: dataBlockNumber - 1n,
                })
                .then((_logs) => setLogs(_logs))
                .catch((reason) => console.log('[ERROR]', { reason }))
    }, [publicClient, dataBlockNumber, address])

    useEffect(() => {
        if (reset && hash && logs && logs.length > 0) {
            logs.forEach((log) => {
                if (hash && log.transactionHash == hash) {
                    setStakeAmount(log.args.amount)
                    setFeeAmount(log.args.fee)
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
        isSuccess: Boolean(stakeAmount),
        isPendingSimulation,
        isSuccessSimulation,
        stakeAmount,
        feeAmount,
        hash,
    }
}
