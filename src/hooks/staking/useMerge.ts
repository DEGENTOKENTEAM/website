import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { useState } from 'react'
import { Address } from 'viem'

export const useMerge = (
    enabled: boolean,
    address: Address,
    chainId: number,
    tokenIds: bigint[],
    includeRewards: boolean,
    targetBucketId: Address,
    targetToken: Address,
    actionFeeActive: boolean,
    actionFeeAmount: bigint
) => {
    const [feeAmount, setFeeAmount] = useState<bigint>()
    const [mergeAmount, setMergeAmount] = useState<bigint>()
    const [claimedAmount, setClaimedAmount] = useState<bigint>()

    const onEventMatch = (event: any) => {
        if (event && event.args) {
            setFeeAmount(event.args.fee)
            setMergeAmount(event.args.amount)
            setClaimedAmount(event.args.reward.amount)
        }
    }

    const execProps = useExecuteFunction({
        abi,
        address,
        args: [
            {
                tokenIds,
                includeRewards,
                targetBucketId,
                targetToken,
            },
        ],
        functionName: 'stakeXMerge',
        chainId,
        eventNames: ['Merged'],
        enabled,
        value: actionFeeActive && actionFeeAmount > 0n ? actionFeeAmount : 0n,
        onEventMatch,
    })

    return { ...execProps, feeAmount, mergeAmount, claimedAmount }
}
