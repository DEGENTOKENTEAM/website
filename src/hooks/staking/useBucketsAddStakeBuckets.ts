import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { BucketParams, StakeBucketUpdateShareParams } from '@dapptypes'
import { Address } from 'viem'

export const useBucketsAddStakeBuckets = (
    chainId: number,
    address: Address,
    params: BucketParams[],
    paramsShares: StakeBucketUpdateShareParams[]
) =>
    useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXAddStakeBuckets',
        args: [params, paramsShares],
        eventNames: ['AddedStakeBuckets'],
        enabled: Boolean(params && params && params.length && paramsShares),
    })
