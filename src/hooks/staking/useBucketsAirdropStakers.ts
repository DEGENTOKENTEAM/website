import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { isNumber } from 'lodash'
import { useState } from 'react'
import { Address } from 'viem'
import { useEstimateGas, usePublicClient } from 'wagmi'

export const useBucketsAirdropStakers = (
    address: Address,
    chainId: number,
    bucketId: Address | null,
    limit: number
) => {
    const [stakesAirdropped, setStakesAirdropped] = useState<bigint>()

    const onEventMatch = (event: any) =>
        event &&
        event.args &&
        event.args.stakesAirdropped &&
        setStakesAirdropped(event.args.stakesAirdropped)

    const execProps = useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXBucketsAirdropStakers',
        args: [bucketId, limit || 0],
        eventNames: ['StakesAirdropped'],
        enabled: Boolean(bucketId) && isNumber(limit),
        onEventMatch,
    })

    return { ...execProps, stakesAirdropped }
}
