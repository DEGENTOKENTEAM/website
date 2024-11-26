import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useInjectRewards = (
    address: Address,
    chainId: number,
    token: Address,
    amount: bigint,
    isEnabled: boolean,
    actionFeeActive: boolean,
    actionFeeAmount: bigint
) =>
    useExecuteFunction({
        abi,
        address,
        args: [token, amount],
        chainId,
        value: actionFeeActive && actionFeeAmount > 0n ? actionFeeAmount : 0n,
        eventNames: ['Deposited'],
        functionName: 'deposit',
        enabled: isEnabled,
    })
