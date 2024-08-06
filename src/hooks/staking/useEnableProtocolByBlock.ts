import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { isUndefined } from 'lodash'
import { Address } from 'viem'

export const useEnableProtocolByBlock = (
    address: Address,
    chainId: number,
    blockNumber: bigint
) =>
    useExecuteFunction(
        address,
        chainId,
        abi,
        'stakeXEnableProtocolByBlock',
        [blockNumber],
        ['UpdatedActiveBlock'],
        Boolean(address && chainId && !isUndefined(blockNumber))
    )
