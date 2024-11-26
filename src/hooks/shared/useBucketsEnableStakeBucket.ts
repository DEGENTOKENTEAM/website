import abi from '@dappabis/stakex/abi-ui.json'
import { isBoolean } from 'lodash'
import { Address } from 'viem'
import { useExecuteFunction } from './useExecuteFunction'

export const useBucketsEnableStakeBucket = (
    chainId: number,
    address: Address,
    bucketId: Address,
    enableState: boolean
) =>
    useExecuteFunction({
        abi,
        address,
        chainId,
        args: [bucketId, enableState],
        eventNames: ['EnabledStakeBucket', 'DisabledStakeBucket'],
        functionName: 'stakeXEnableStakeBucket',
        enabled: Boolean(bucketId && isBoolean(enableState)),
    })
