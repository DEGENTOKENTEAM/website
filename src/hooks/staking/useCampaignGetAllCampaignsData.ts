import abi from '@dappabis/stakex/abi-ui.json'
import { CampaignData } from '@dapptypes'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useCampaignsGetAllCampaignsData = (
    address: Address,
    chainId: number
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: `stakeXGetAllCampaignsData`,
        query: {
            select: (data: CampaignData[]) => data,
            enabled: Boolean(address && chainId),
        },
    })

//
