import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetActivationBlock = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'getActivationBlock',
        query: {
            select: (data: bigint) => data,
            enabled: Boolean(address && chainId),
        },
    })
