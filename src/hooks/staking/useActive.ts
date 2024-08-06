import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useActive = (
    address: Address,
    chainId: number,
    refetchIntervalInMs?: number
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: `isActive`,
        query: {
            select: (data: boolean) => data,
            refetchInterval: refetchIntervalInMs || 5000,
            enabled: Boolean(address && chainId),
        },
    })
