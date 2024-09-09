import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { isUndefined } from 'lodash'
import { Address } from 'viem'

export const useEnableProtocolByBlock = (
    address: Address,
    chainId: number,
    blockNumber: bigint,
    enable: boolean
) =>
    useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXEnableProtocolByBlock',
        args: [blockNumber],
        eventNames: ['UpdatedActiveBlock'],
        enabled: Boolean(
            address && chainId && !isUndefined(blockNumber) && enable
        ),
    })
