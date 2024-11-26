import abi from '@dappabis/stakex/abi-ui.json'
import { CampaignData } from '@dapptypes'
import { isUndefined } from 'lodash'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useCampaignsGetCampaignData = (
    address: Address,
    chainId: number,
    bucketId: Address
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: `stakeXGetCampaignData`,
        args: [bucketId],
        query: {
            select: (data: CampaignData) => data,
            enabled: Boolean(address && chainId) && !isUndefined(bucketId),
        },
    })

//
