import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export type BucketStakedShare = {
    bucketId: Address
    share: bigint
    staked: bigint
    divider: number
}

export const useGetStakedSharesByStaker = (
    address: Address,
    chainId: number,
    staker: Address
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: `getStakedSharesByStaker`,
        args: [staker],
        query: {
            select: (data: BucketStakedShare[]) => data,
            enabled: Boolean(address && chainId && staker),
        },
    })
