import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useVersion = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: `VERSION_MAJOR`,
        query: {
            select: (data: number) => data,
            enabled: Boolean(address && chainId),
        },
    })
