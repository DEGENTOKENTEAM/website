import abi from '@dappabis/controller.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetBaseToken = () =>
    useReadContract({
        abi,
        address: process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS! as Address,
        functionName: 'baseToken',
        query: {
            select: (data: Address) => data,
        },
    })
