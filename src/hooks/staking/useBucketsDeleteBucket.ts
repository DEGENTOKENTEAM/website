import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { StakeBucketUpdateShareParams } from '@dapptypes'
import { Address } from 'viem'

export const useBucketsDeleteBucket = (
    address: Address,
    chainId: number,
    bucketId: Address | null,
    shares: StakeBucketUpdateShareParams[] | null
) =>
    useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXBucketsDeleteBucket',
        eventNames: ['BucketDeleted'],
        args: [bucketId, shares],
        enabled: Boolean(bucketId && shares && shares.length > 0),
    })
