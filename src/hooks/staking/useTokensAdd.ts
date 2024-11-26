import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { TokenAddParams } from '@dapptypes'
import { Address } from 'viem'

export const useTokensAdd = (
    address: Address,
    chainId: number,
    params: TokenAddParams
) =>
    useExecuteFunction({
        abi,
        address,
        args: [params],
        chainId,
        eventNames: ['AddedToken'],
        functionName: 'stakeXTokensAdd',
    })
