import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useActive = (
    address: Address,
    chainId: number,
    refetch?: boolean,
    refetchIntervalInMs?: number
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: `isActive`,
        query: {
            select: (data: boolean) => data,
            refetchInterval:
                refetch === true ? refetchIntervalInMs || 5000 : false,
            enabled: Boolean(address && chainId),
        },
    })
