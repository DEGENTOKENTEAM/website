import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { isUndefined } from 'lodash'
import { Address } from 'viem'

export const useEnableProtocolByTime = (
    address: Address,
    chainId: number,
    timestamp: bigint
) =>
    useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXEnableProtocolByTime',
        args: [timestamp],
        eventNames: ['UpdatedActiveTime'],
        enabled: Boolean(address && chainId && !isUndefined(timestamp)),
    })
