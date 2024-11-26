import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { STAKEXManagementUpdateCampaignParams } from '@dapptypes'
import { Address } from 'viem'

export const useCampaignUpdate = (
    address: Address,
    chainId: number,
    params: STAKEXManagementUpdateCampaignParams
) =>
    useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXCampaignUpdate',
        eventNames: ['CampaignUpdated'],
        args: [params],
        enabled: Boolean(
            params &&
                params.bucketId &&
                params.bucketId.length > 0 &&
                params.period > 0n &&
                params.rewardAmount > 0n
        ),
    })
