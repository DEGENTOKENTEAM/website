import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { STAKEXManagementCreateCampaignParams } from '@dapptypes'
import { omit } from 'lodash'
import { Address } from 'viem'

export const useCampaignCreate = (
    address: Address,
    chainId: number,
    params: STAKEXManagementCreateCampaignParams
) =>
    useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXCampaignCreate',
        eventNames: ['CampaignCreated'],
        args: [omit(params, ['bucketId'])],
        enabled: Boolean(params.period > 0n && params.rewardAmount > 0n),
    })
