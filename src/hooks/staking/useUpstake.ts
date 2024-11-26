import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { useState } from 'react'
import { Address } from 'viem'

export const useUpstake = (
    enabled: boolean,
    address: Address,
    chainId: number,
    tokenId: bigint,
    stakeBucketId: Address,
    includeRewards: boolean,
    target: Address,
    actionFeeActive: boolean,
    actionFeeAmount: bigint
) => {
    const [feeAmount, setFeeAmount] = useState<bigint>()
    const [upstakeAmount, setUpstakeAmount] = useState<bigint>()
    const [claimedAmount, setClaimedAmount] = useState<bigint>()

    const onEventMatch = (event: any) => {
        if (event && event.args) {
            setFeeAmount(event.args.fee)
            setUpstakeAmount(event.args.amount)
            setClaimedAmount(event.args.reward.amount)
        }
    }

    const execProps = useExecuteFunction({
        abi,
        address,
        args: [
            {
                tokenId,
                targetBucketId: stakeBucketId,
                includeRewards,
                targetToken: target,
            },
        ],
        functionName: 'stakeXUpstake',
        chainId,
        eventNames: ['Upstaked'],
        enabled,
        value: actionFeeActive && actionFeeAmount > 0n ? actionFeeAmount : 0n,
        onEventMatch,
    })

    return { ...execProps, feeAmount, upstakeAmount, claimedAmount }
}
