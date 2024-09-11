import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { useState } from 'react'
import { Address } from 'viem'

export const useClaimAll = (
    address: Address,
    chainId: number,
    target: Address,
    isEnabled: boolean
) => {
    const [rewardAmount, setRewardAmount] = useState<bigint>()

    const onEventMatch = (event: any) => {
        if (event && event.args) setRewardAmount(event.args.reward.amount)
    }

    const execProps = useExecuteFunction({
        abi,
        address,
        args: [target],
        chainId,
        eventNames: ['ClaimedAll'],
        functionName: 'claimAll',
        enabled: isEnabled,
        onEventMatch,
    })

    return { ...execProps, rewardAmount }
}
