//

import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteAndTransferFunction } from '@dapphooks/shared/useExecuteAndTransferFunction'
import { STAKEXManagementUpdateCampaignParams } from '@dapptypes'
import { Address } from 'viem'

export const useCampaignOpen = (
    address: Address,
    chainId: number,
    account: Address,
    transferToken: Address,
    transferAmount: bigint,
    params: STAKEXManagementUpdateCampaignParams
) =>
    useExecuteAndTransferFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXCampaignOpen',
        eventNames: ['CampaignOpened'],
        args: [params],
        account,
        transferToken,
        transferAmount,
        enabled: Boolean(
            params &&
                params.bucketId &&
                params.rewardAmount &&
                params.rewardAmount > 0n &&
                params.period > 0n
        ),
    })
