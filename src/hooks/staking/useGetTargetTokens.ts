import abi from '@dappabis/stakex/abi-ui.json'
import { TokenInfoResponse } from '@dapptypes'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetTargetTokens = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'getTargetTokens',
        query: {
            enabled: Boolean(address && chainId),
            select: (data: TokenInfoResponse[]) => data,
        },
    })
