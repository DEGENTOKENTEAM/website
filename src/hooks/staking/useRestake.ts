import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { useState } from 'react'
import { Address } from 'viem'

export const useRestake = (
    enabled: boolean,
    address: Address,
    chainId: number,
    tokenId: bigint,
    stakeBucketId: Address,
    actionFeeActive: boolean,
    actionFeeAmount: bigint
) => {
    const [feeAmount, setFeeAmount] = useState<bigint>()
    const [restakeAmount, setRestakeAmount] = useState<bigint>()

    const onEventMatch = (event: any) => {
        if (event && event.args) {
            setFeeAmount(event.args.fee)
            setRestakeAmount(event.args.amount)
        }
    }

    const execProps = useExecuteFunction({
        abi,
        address,
        args: [tokenId, stakeBucketId],
        functionName: 'restake',
        chainId,
        eventNames: ['Restaked'],
        enabled,
        value: actionFeeActive && actionFeeAmount > 0n ? actionFeeAmount : 0n,
        onEventMatch,
    })

    return { ...execProps, feeAmount, restakeAmount }
}
