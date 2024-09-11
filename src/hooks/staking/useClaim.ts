import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useClaim = (
    address: Address,
    chainId: number,
    tokenId: bigint,
    target: Address,
    isEnabled: boolean
) =>
    useExecuteFunction({
        abi,
        address,
        args: [tokenId, target],
        chainId,
        functionName: 'claim',
        eventNames: ['Claimed'],
        enabled: isEnabled,
    })
