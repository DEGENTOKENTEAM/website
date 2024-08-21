import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useNFTAddConfig = (
    address: Address,
    chainId: number,
    nftConfig: any
) =>
    useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'stakeXNFTAddConfig',
        args: [nftConfig],
        eventNames: ['AddedConfig'],
        enabled: Boolean(address && chainId && nftConfig),
    })
