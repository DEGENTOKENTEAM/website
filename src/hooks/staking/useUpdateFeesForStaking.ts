import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useUpdateFeesForStaking = (
    address: Address,
    chainId: number,
    feeStake: bigint,
    feeUnstake: bigint,
    feeRestake: bigint
) =>
    useExecuteFunction({
        abi,
        address,
        chainId,
        args: [feeStake, feeUnstake, feeRestake],
        eventNames: ['UpdatedFeeForStaking'],
        functionName: 'stakeXUpdateFeesForStaking',
    })
