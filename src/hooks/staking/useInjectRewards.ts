import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useInjectRewards = (
    address: Address,
    chainId: number,
    token: Address,
    amount: bigint,
    isEnabled: boolean
) =>
    useExecuteFunction({
        abi,
        address,
        args: [token, amount],
        chainId,
        eventNames: ['Deposited'],
        functionName: 'deposit',
        enabled: isEnabled,
    })
