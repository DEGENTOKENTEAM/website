import erc20Abi from '@dappabis/erc20.json'
import { TokenInfo } from '@dapptypes'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

type useGetTokenInfoProps = {
    token: Address
    chainId?: number
    enabled: boolean
}
export const useGetTokenInfo = ({
    token,
    chainId = 43114,
    enabled,
}: useGetTokenInfoProps) =>
    useReadContracts({
        contracts: [
            {
                address: token,
                chainId,
                abi: erc20Abi,
                functionName: 'name',
            },
            {
                address: token,
                chainId,
                abi: erc20Abi,
                functionName: 'symbol',
            },
            {
                address: token,
                chainId,
                abi: erc20Abi,
                functionName: 'decimals',
            },
        ],
        query: {
            enabled,
            select: ([name, symbol, decimals]) =>
                ({
                    name: name.status == 'success' ? name.result : null,
                    symbol: symbol.status == 'success' ? symbol.result : null,
                    decimals:
                        decimals.status == 'success' ? decimals.result : null,
                    source: token,
                } as TokenInfo),
        },
    })
