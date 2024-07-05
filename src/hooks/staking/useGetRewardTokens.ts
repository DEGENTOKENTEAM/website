import abi from '@dappabis/stakex/abi-ui.json'
import { TokenInfoResponse } from '@dapptypes'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetRewardTokens = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'getRewardTokens',
        query: {
            select: (data: TokenInfoResponse[]) => data,
        },
    })
