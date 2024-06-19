import { Chain, avalanche, avalancheFuji, mainnet } from 'viem/chains'
export const chains: Chain[] = [avalanche, avalancheFuji, mainnet]
export const chainsByChainId = chains.reduce(
    (acc, chain) => ({
        ...acc,
        [chain.id]: chain,
    }),
    {} as { [key: number]: Chain }
)
