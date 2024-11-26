import { useFetch } from '@dapphooks/shared/useFetch'
import { CampaignResponse } from 'shared/types'
import { Address } from 'viem'

type useGetProtocolsProps = {
    account?: Address
    chainId?: Number
}

export const useGetCampaigns = ({ account, chainId }: useGetProtocolsProps) =>
    useFetch<CampaignResponse[]>({
        url:
            `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/stakex/campaigns/` +
            (account ? `account/${account}/` : chainId ? `${chainId}/` : ''),
    })
