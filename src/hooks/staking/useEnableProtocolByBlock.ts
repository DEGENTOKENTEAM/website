import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { isUndefined } from 'lodash'
import { Address } from 'viem'

export const useEnableProtocolByBlock = (
    address: Address,
    chainId: number,
    blockNumber: bigint
) =>
    useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXEnableProtocolByBlock',
        args: [blockNumber],
        eventNames: ['UpdatedActiveBlock'],
        enabled: !isUndefined(blockNumber),
    })
