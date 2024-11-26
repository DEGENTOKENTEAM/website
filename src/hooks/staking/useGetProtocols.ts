import { useFetch } from '@dapphooks/shared/useFetch'
import { ProtocolsResponse } from 'shared/types'
import { Address } from 'viem'

type useGetProtocolsProps = {
    account?: Address
    chainId?: Number
}

export const useGetProtocols = ({ account, chainId }: useGetProtocolsProps) =>
    useFetch<ProtocolsResponse[]>({
        url:
            `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/stakex/protocols/` +
            (account ? `account/${account}/` : chainId ? `${chainId}/` : ''),
    })
