import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useInitialized = (address: Address) =>
    useReadContract({
        address,
        abi,
        functionName: `isInitialized`,
        query: {
            select: (data: boolean) => data,
        },
    })
