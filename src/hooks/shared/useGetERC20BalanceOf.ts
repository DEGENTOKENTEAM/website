import erc20Abi from '@dappabis/erc20.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetERC20BalanceOf = (
    token: Address,
    owner: Address,
    chainId: number
) =>
    useReadContract({
        address: token,
        chainId,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [owner],
        query: {
            select: (data: bigint) => data,
            enabled: Boolean(token && owner && chainId),
        },
    })
