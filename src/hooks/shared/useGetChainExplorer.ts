import { explorerByChainId } from 'shared/supportedChains'
import { Chain } from 'viem'

export const useGetChainExplorer = (chain: Chain) =>
    chain && explorerByChainId(chain.id)
