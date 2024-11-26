import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetMergeFee = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'stakeXGetFeeForMerge',
        query: {
            select: (data: bigint) => data,
            enabled: Boolean(address && chainId),
        },
    })
