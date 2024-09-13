import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { useState } from 'react'
import { Address } from 'viem'

export const useWithdraw = (
    enabled: boolean,
    address: Address,
    chainId: number,
    tokenId: bigint,
    target: Address
) => {
    const [feeAmount, setFeeAmount] = useState<bigint>()
    const [claimedAmount, setClaimedAmount] = useState<bigint>()
    const [withdrawnAmount, setWithdrawnAmount] = useState<bigint>()

    const onEventMatch = (event: any) => {
        if (event && event.args) {
            setFeeAmount(event.args.fee)
            setClaimedAmount(event.args.rewardAmount)
            setWithdrawnAmount(event.args.unstakeAmount)
        }
    }
    const execProps = useExecuteFunction({
        abi,
        address,
        args: [tokenId, target],
        functionName: 'unstake',
        chainId,
        eventNames: ['Unstaked'],
        enabled,
        onEventMatch,
    })
    return { ...execProps, feeAmount, claimedAmount, withdrawnAmount }
}
