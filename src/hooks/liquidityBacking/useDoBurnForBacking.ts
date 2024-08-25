import abi from '@dappabis/controller.json'
import { useCallback } from 'react'
import { Address } from 'viem'
import { useSimulateContract, useWriteContract } from 'wagmi'

export const useDoBurnForBacking = (
    amountToBurn: bigint,
    wantTokenAddress: Address,
    wantTokenAmountExpected: bigint,
    chainId: number
) => {
    const { data, isError, error } = useSimulateContract({
        address: process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS! as Address,
        chainId,
        abi,
        functionName: 'payout',
        args: [wantTokenAddress, amountToBurn, wantTokenAmountExpected],
    })

    const {
        writeContract,
        data: hash,
        isPending,
        isSuccess,
        reset,
    } = useWriteContract()

    const write = useCallback(() => {
        data && writeContract && writeContract(data.request)
    }, [data, writeContract])

    return {
        write,
        reset,
        error,
        isError,
        isPending,
        isSuccess,
        hash,
    }
}
