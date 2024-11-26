import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useCampaignDelete = (
    address: Address,
    chainId: number,
    bucketId: Address
) =>
    useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXCampaignDelete',
        eventNames: ['CampaignDeleted'],
        args: [bucketId],
        enabled: Boolean(bucketId),
    })
