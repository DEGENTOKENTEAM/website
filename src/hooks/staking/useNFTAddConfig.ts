import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useNFTAddConfig = (
    address: Address,
    chainId: number,
    nftConfig: any
) =>
    useExecuteFunction(
        address,
        chainId,
        abi,
        'stakeXNFTAddConfig',
        [nftConfig],
        ['AddedConfig'],
        Boolean(address && chainId && nftConfig)
    )
