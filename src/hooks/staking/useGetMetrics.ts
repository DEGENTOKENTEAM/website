import { useFetch } from '@dapphooks/shared/useFetch'
import { StakingMetrics } from '@dapptypes'
import { Address } from 'viem'

export const useGetMetrics = (protocol: Address, chainId: number) =>
    useFetch<StakingMetrics>({
        enabled: Boolean(chainId && protocol),
        url: `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/stakex/metrics/${chainId}/${protocol}`,
    })
