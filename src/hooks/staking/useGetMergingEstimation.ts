import abi from '@dappabis/stakex/abi-ui.json'
import { isBoolean } from 'lodash'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetMergingEstimation = (
    address: Address,
    chainId: number,
    tokenIds: bigint[],
    includeRewards: boolean,
    targetBucketId: Address,
    targetToken: Address
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'stakeXGetMergingEstimation',
        args: [{ tokenIds, includeRewards, targetBucketId, targetToken }],
        query: {
            select: ([stakeAmount, targetAmount, feeAmount]: [
                bigint,
                bigint,
                bigint
            ]) => ({
                stakeAmount,
                targetAmount,
                feeAmount,
            }),
            enabled: Boolean(
                address &&
                    chainId &&
                    tokenIds &&
                    tokenIds.length &&
                    isBoolean(includeRewards) &&
                    targetBucketId &&
                    targetToken
            ),
        },
    })
