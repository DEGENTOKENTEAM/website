import abi from '@dappabis/erc20.json'
import { isUndefined } from 'lodash'
import { Address } from 'viem'
import { useExecuteFunction } from './useExecuteFunction'

export const useERC20Approve = (
    address: Address,
    spender: Address,
    amount: bigint,
    chainId: number
) =>
    useExecuteFunction({
        address,
        chainId,
        functionName: 'approve',
        eventNames: [],
        args: [spender, amount],
        abi,
        enabled: Boolean(spender && !isUndefined(amount)),
    })
