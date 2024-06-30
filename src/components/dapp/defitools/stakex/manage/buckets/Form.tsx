import { StakeBucket } from '@dapptypes'
import { Address } from 'viem'

export type BucketAddParams = {
    burn: boolean
    lock: bigint
    share: bigint
}

export type StakeBucketUpdateShareParams = {
    id: Address
    share: bigint
}
type BucketsFormType = {
    buckets: StakeBucket[]
    onSubmit: () => void
    onCancel: () => void
}

export const BucketsForm = ({
    buckets,
    onSubmit,
    onCancel,
}: BucketsFormType) => {
    return <div></div>
}
