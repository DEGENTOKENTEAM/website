import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const usePaymentGetFeeInNative = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'stakeXPaymentGetFeeInNative',
        args: [200],
        query: {
            select: ([fee, thresholdFee]: [bigint, bigint]) => ({
                fee,
                thresholdFee,
            }),
            enabled: Boolean(address && chainId),
        },
    })
