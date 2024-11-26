//

import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { STAKEXManagementUpdateCampaignParams } from '@dapptypes'
import { Address } from 'viem'

export const useCampaignOpen = (
    address: Address,
    chainId: number,
    params: STAKEXManagementUpdateCampaignParams
) =>
    useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXCampaignOpen',
        eventNames: ['CampaignOpened'],
        args: [params],
        enabled: Boolean(
            params &&
                params.bucketId &&
                params.rewardAmount > 0n &&
                params.period > 0n
        ),
    })
