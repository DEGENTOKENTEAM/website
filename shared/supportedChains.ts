import { get } from 'lodash'
import { Address, defineChain } from 'viem'
import {
    Chain,
    avalancheFuji,
    avalanche as avalancheOriginal,
    hardhat,
    mainnet,
} from 'wagmi/chains'

const avalanche = defineChain({
    ...avalancheOriginal,
    rpcUrls: {
        ...avalancheOriginal.rpcUrls,
        default: {
            ...avalancheOriginal.rpcUrls.default,
            http: [
                // 'https://avalanche.public-rpc.com',
                'https://api.tatum.io/v3/blockchain/node/avax-mainnet',
                // 'http://127.0.0.1:8545',
                ...avalancheOriginal.rpcUrls.default.http,
            ],
        },
    },
})

export const chains: Chain[] = [avalanche, hardhat, avalancheFuji, mainnet]

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
