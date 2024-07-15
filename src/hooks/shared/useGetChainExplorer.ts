import { getExplorerByChainId } from 'shared/supportedChains'
import { Chain } from 'viem'

export const useGetChainExplorer = (chain: Chain) =>
    chain && getExplorerByChainId(chain.id)
