import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const usePaymentIsInitialized = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'stakeXPaymentIsInitialized',
        query: {
            select: (data: boolean) => data,
            enabled: Boolean(address && chainId),
        },
    })
