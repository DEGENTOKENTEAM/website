import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useUpdateFeeForMerging = (
    address: Address,
    chainId: number,
    fee: bigint
) =>
    useExecuteFunction({
        abi,
        address,
        chainId,
        args: [fee],
        eventNames: ['UpdatedFeeForMerging'],
        functionName: 'stakeXUpdateFeeForMerging',
    })
