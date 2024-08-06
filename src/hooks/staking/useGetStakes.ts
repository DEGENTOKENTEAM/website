import abi from '@dappabis/stakex/abi-ui.json'
import { StakeResponse } from '@dapptypes'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetStakes = (
    address: Address,
    chainId: number,
    staker: Address,
    isEnabled: boolean
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'getStakes',
        args: [staker],
        query: {
            select: (data: StakeResponse[]) => data,
            enabled: Boolean(address && chainId && staker && isEnabled),
        },
    })
