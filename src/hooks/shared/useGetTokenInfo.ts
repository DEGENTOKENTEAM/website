import erc20Abi from '@dappabis/erc20.json'
import { TokenInfo } from '@dapptypes'
import { isNull } from 'lodash'
import { Address, isAddress, zeroAddress } from 'viem'
import { useReadContracts } from 'wagmi'

type useGetTokenInfoProps = {
    token: Address | null
    chainId: number
}
export const useGetTokenInfo = ({ token, chainId }: useGetTokenInfoProps) =>
    useReadContracts({
        contracts: [
            {
                address: token || zeroAddress,
                chainId,
                abi: erc20Abi,
                functionName: 'name',
            },
            {
                address: token || zeroAddress,
                chainId,
                abi: erc20Abi,
                functionName: 'symbol',
            },
            {
                address: token || zeroAddress,
                chainId,
                abi: erc20Abi,
                functionName: 'decimals',
            },
        ],
        query: {
            enabled: Boolean(token && chainId && isAddress(token)),
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
