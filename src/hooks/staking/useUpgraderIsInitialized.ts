import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useUpgraderIsInitialized = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'upgraderIsInitialized',
        query: {
            enabled: Boolean(address && chainId),
            select: (data: boolean) => data,
        },
    })
