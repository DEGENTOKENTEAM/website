import abi from '@dappabis/controller.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetTotalValue = (wantToken: Address) =>
    useReadContract({
        abi,
        address: process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS! as Address,
        functionName: 'getTotalValue',
        args: [wantToken],
        query: {
            select: (data: bigint) => data,
        },
    })
