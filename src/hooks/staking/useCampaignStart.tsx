import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useCampaignStart = (address: Address, chainId: number, bucketId: Address) =>
    useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXCampaignStart',
        eventNames: ['CampaignStarted'],
        args: [bucketId],
        enabled: Boolean(bucketId),
    })
