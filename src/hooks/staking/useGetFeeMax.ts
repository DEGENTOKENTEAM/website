import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetFeeMax = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: `getFeeForMax`,
        query: {
            select: (data: number) => BigInt(data),
            enabled: Boolean(address && chainId),
        },
    })
