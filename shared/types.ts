import { StakeXCampaignsResponse } from 'api/services/campaigns'
import { ExactPartial } from 'viem'

export type ProtocolsResponse = {
    protocol: {
        name: string
        logo: string
        stakedRel: number
        stakedAbs: string | bigint // is converted bigint as string
        stakers: number
        stakes: number
        apr: number
        apy: number
        source: string
        chainId: number
        isRunning: boolean
    }
    token: {
        symbol: string
        decimals: number
    }
}

export type CampaignResponse = ExactPartial<StakeXCampaignsResponse>
