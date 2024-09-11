import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useClaimAll = (
    address: Address,
    chainId: number,
    target: Address,
    isEnabled: boolean
) =>
    useExecuteFunction({
        abi,
        address,
        args: [target],
        chainId,
        eventNames: ['ClaimedAll'],
        functionName: 'claimAll',
        enabled: isEnabled,
    })
