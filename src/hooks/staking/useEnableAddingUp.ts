import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useEnableAddingUp = (
    address: Address,
    chainId: number,
    status: boolean,
    enabled: boolean
) =>
    useExecuteFunction({
        abi,
        address,
        chainId,
        args: [status],
        enabled,
        functionName: 'stakeXEnableAddingUp',
        eventNames: ['EnabledAddingUp', 'DisabledAddingUp'],
    })
