import abi from '@dappabis/controller.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetBackingFromWantToken = (
    wantToken: Address,
    amount: bigint,
    chainId: number
) =>
    useReadContract({
        abi,
        address: process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS! as Address,
        chainId,
        functionName: 'getValueOfTokensForBaseToken',
        args: [wantToken, amount],
        query: {
            select: (data: bigint) => data,
        },
    })
