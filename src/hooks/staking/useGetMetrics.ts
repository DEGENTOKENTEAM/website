import { useFetch } from '@dapphooks/shared/useFetch'
import { StakingMetrics } from '@dapptypes'
import { Address } from 'viem'

type useGetMetricsType = {
    chainId: number
    protocol: Address
}
export const useGetMetrics = ({ chainId, protocol }: useGetMetricsType) =>
    useFetch<StakingMetrics>({
        enabled: Boolean(chainId && protocol),
        url: `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/stakex/metrics/${chainId}/${protocol}`,
    })
