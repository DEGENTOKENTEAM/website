import abi from '@dappabis/stakex/abi-ui.json'
import { TokenInfoResponse } from '@dapptypes'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetRewardTokens = (address: Address) =>
    useReadContract({
        address,
        abi,
        functionName: 'getRewardTokens',
        query: {
            select: (data: TokenInfoResponse[]) => data,
        },
    })
