import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useCampaignRemoveStale = (address: Address, chainId: number) =>
    useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXCampaignPurgeStale',
        eventNames: ['CampaignsPurged'],
        args: [],
    })
