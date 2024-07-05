import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useHasDepositRestriction = (chainId: number, address: Address) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'hasDepositRestriction',
        query: {
            select: (data: boolean) => data,
        },
    })
