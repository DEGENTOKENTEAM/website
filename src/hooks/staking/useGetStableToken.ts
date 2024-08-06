import abi from '@dappabis/stakex/abi-ui.json'
import { TokenInfoResponse } from '@dapptypes'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetStableToken = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'getStableToken',
        query: {
            select: (data: TokenInfoResponse) => data,
            enabled: Boolean(address && chainId),
        },
    })
