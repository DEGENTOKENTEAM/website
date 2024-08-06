import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetActivationTime = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'getActivationTime',
        query: {
            select: (data: bigint) => data,
            enabled: Boolean(address && chainId),
        },
    })
