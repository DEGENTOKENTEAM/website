import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { useState } from 'react'
import { Address } from 'viem'

export const useAddUp = (
    enabled: boolean,
    address: Address,
    chainId: number,
    tokenId: bigint,
    amount: bigint,
    includeRewards: boolean,
    targetToken: Address,
    actionFeeActive: boolean,
    actionFeeAmount: bigint
) => {
    const [stakedAmount, setStakedAmount] = useState<bigint>()
    const [claimedAmount, setClaimedAmount] = useState<bigint>()

    const onEventMatch = (event: any) => {
        if (event && event.args) {
            setStakedAmount(event.args.amount)
            setClaimedAmount(event.args.reward.amount)
        }
    }

    const execProps = useExecuteFunction({
        abi,
        address,
        args: [
            {
                tokenId,
                amount,
                targetToken,
                includeRewards,
            },
        ],
        functionName: 'stakeXAddUpStake',
        chainId,
        eventNames: ['AddedUp'],
        enabled,
        value: actionFeeActive && actionFeeAmount > 0n ? actionFeeAmount : 0n,
        onEventMatch,
    })

    return { ...execProps, stakedAmount, claimedAmount }
}
