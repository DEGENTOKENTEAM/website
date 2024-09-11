import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { useState } from 'react'
import { Address } from 'viem'

export const useClaim = (
    address: Address,
    chainId: number,
    tokenId: bigint,
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
        args: [tokenId, target],
        chainId,
        functionName: 'claim',
        eventNames: ['Claimed'],
        enabled: isEnabled,
        onEventMatch,
    })

    return { ...execProps, rewardAmount }
}
