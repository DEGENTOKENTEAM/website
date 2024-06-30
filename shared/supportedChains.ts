import { Chain, avalanche, avalancheFuji, mainnet } from 'viem/chains'
import { get } from 'lodash'
import { Address } from 'viem'
export const chains: Chain[] = [avalanche, avalancheFuji, mainnet]
export const chainIdToChainsMap = chains.reduce(
    (acc, chain) => ({
        ...acc,
        [chain.id]: chain,
    }),
    {} as { [key: number]: Chain }
)
export const chainByChainId = (chainId: number) =>
    get(chainIdToChainsMap, chainId, null)

export const explorerByChainId = (chainId: number) =>
    get(
        {
            [avalanche.id]: {
                name: 'snowscan.xyz',
                getTxUrl: (txHash: Address) =>
                    `https://snowscan.xyz/tx/${txHash}`,
                getTokenUrl: (token: Address) =>
                    `https://snowscan.xyz/token/${token}`,
                getAddressUrl: (token: Address) =>
                    `https://snowscan.xyz/address/${token}`,
            },
        },
        chainId,
        null
    )
