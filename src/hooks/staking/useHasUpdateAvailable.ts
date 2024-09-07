import { useFetch } from '@dapphooks/shared/useFetch'
import { Address } from 'viem'

type useHasUpdateAvailableType = {
    protocol: Address
    chainId: number
    enabled: boolean
}
export const useHasUpdateAvailable = ({
    protocol,
    chainId,
    enabled,
}: useHasUpdateAvailableType) =>
    useFetch({
        url: `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/stakex/update-check/${chainId}/${protocol}`,
        enabled,
    })
