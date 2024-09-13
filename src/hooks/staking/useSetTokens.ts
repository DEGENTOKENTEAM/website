import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { SetTargetTokenParams } from '@dapptypes'
import { Address } from 'viem'

export const useSetTokens = (
    enabled: boolean,
    chainId: number,
    address: Address,
    params: SetTargetTokenParams,
    isReward: boolean
) =>
    useExecuteFunction({
        abi,
        address,
        args: [params],
        chainId,
        eventNames: [],
        functionName: isReward
            ? 'stakeXAddRewardAndTargetToken'
            : 'stakeXSetTargetToken',
        enabled,
    })
