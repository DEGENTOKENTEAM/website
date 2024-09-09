import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { useState } from 'react'
import { Address } from 'viem'

export const useDepositStake = (
    address: Address,
    chainId: number,
    stakeBucketId: Address,
    amount: bigint,
    isEnabled: boolean
) => {
    const [feeAmount, setFeeAmount] = useState<bigint>()
    const [stakeAmount, setStakeAmount] = useState<bigint>()

    const onEventMatch = (event: any) => {
        if (event && event.args) {
            setFeeAmount(event.args.fee)
            setStakeAmount(event.args.amount)
        }
    }

    const execProps = useExecuteFunction({
        address,
        abi,
        chainId,
        functionName: 'stake',
        args: [stakeBucketId, amount],
        eventNames: ['Staked'],
        enabled: isEnabled,
        onEventMatch,
    })

    return { ...execProps, feeAmount, stakeAmount }
}
