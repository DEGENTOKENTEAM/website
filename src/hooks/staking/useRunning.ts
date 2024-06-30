import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useRunning = (address: Address) =>
    useReadContract({
        address,
        abi,
        functionName: `isRunning`,
        query: {
            select: (data: boolean) => data,
        },
    })
