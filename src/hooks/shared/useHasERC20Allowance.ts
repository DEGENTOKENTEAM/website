import erc20Abi from '@dappabis/erc20.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useHasERC20Allowance = (
    token: Address,
    owner: Address,
    spender: Address,
    chainId: number,
    refetch?: boolean,
    refetchIntervalInMS?: number
) =>
    useReadContract({
        address: token,
        chainId,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [owner, spender],
        query: {
            select: (data: bigint) => data,
            refetchInterval:
                refetch === true ? refetchIntervalInMS || 2000 : false,
            enabled: Boolean(token && owner && spender && chainId),
        },
    })
