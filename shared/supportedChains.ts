import { get } from 'lodash'
import { Address, defineChain } from 'viem'
import {
    Chain,
    avalancheFuji,
    avalanche as avalancheOriginal,
    goerli,
    localhost,
    mainnet as mainnetOriginal,
} from 'viem/chains'

const avalanche = defineChain({
    ...avalancheOriginal,
    rpcUrls: {
        ...avalancheOriginal.rpcUrls,
        default: {
            ...avalancheOriginal.rpcUrls.default,
            http: [
                process.env.USE_LOCALFORK_INSTEAD !== 'true' &&
                process.env.NEXT_PUBLIC_USE_LOCALFORK_INSTEAD !== 'true'
                    ? `https://avalanche-mainnet.infura.io/v3/${
                          process.env.NEXT_PUBLIC_INFURA_ID ||
                          process.env.INFURA_ID
                      }`
                    : 'http://127.0.0.1:8545',
                // 'http://localhost:9650/ext/bc/C/rpc',
                // ...avalancheOriginal.rpcUrls.default.http,
            ],
        },
    },
})
const mainnet = defineChain({
    ...mainnetOriginal,
    rpcUrls: {
        ...mainnetOriginal.rpcUrls,
        default: {
            ...mainnetOriginal.rpcUrls.default,
            http: [
                `https://mainnet.infura.io/v3/${
                    process.env.NEXT_PUBLIC_INFURA_ID || process.env.INFURA_ID
                }`,
                // 'http://localhost:9650/ext/bc/C/rpc',
                ...mainnetOriginal.rpcUrls.default.http,
            ],
        },
    },
})

export const chains: Chain[] = [
    avalanche,
    mainnet,
    process.env.NODE_ENV != 'production' ? localhost : null,
    ...(Boolean(process.env.NEXT_PUBLIC_ENABLE_TESTNETS)
        ? [avalancheFuji, goerli]
        : []),
].filter((chain) => chain) as Chain[]

export const getChainById = (chainId: number) => {
    for (const chain of Object.values(chains))
        if ('id' in chain) if (chain.id === chainId) return chain

    throw new Error(`Chain with id ${chainId} not found`)
}

export const getExplorerByChainId = (chainId: number) =>
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
