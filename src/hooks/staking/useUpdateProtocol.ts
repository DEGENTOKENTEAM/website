import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address, zeroAddress, zeroHash } from 'viem'

export const useUpdateProtocol = (
    chainId: number,
    address: Address,
    cuts: any[],
    enabled: boolean
) =>
    useExecuteFunction({
        enabled,
        abi,
        address,
        args: [cuts, zeroAddress, zeroHash],
        chainId,
        eventNames: [],
        functionName: 'diamondCut',
    })
