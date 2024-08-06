import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useRunning = (
    address: Address,
    chainId: number,
    refetchIntervalInMs?: number
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: `isRunning`,
        query: {
            select: (data: boolean) => data,
            enabled: Boolean(address && chainId),
            refetchInterval: refetchIntervalInMs || 5000,
        },
    })
