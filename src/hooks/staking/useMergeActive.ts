import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useMergeActive = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'stakeXIsMergingActive',
        query: {
            select: (data: boolean) => data,
            enabled: Boolean(address && chainId),
        },
    })
