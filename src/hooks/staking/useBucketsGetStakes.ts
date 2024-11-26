import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useBucketsGetStakes = (
    address: Address,
    chainId: number,
    bucketId: Address | null
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'getStakesByBucket',
        args: [bucketId],
        query: {
            select: (data: bigint) => Number(data),
            enabled: Boolean(address && chainId && bucketId),
        },
    })
