import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useEnableProtocol = (
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
        functionName: 'stakeXEnableProtocol',
        eventNames: ['Enabled', 'Disabled'],
    })
