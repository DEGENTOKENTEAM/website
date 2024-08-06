import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useNFTGetConfigs = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'stakeXNFTGetConfigs',
        query: {
            select: (data: any[]) => data,
            enabled: Boolean(address && chainId),
        },
    })
