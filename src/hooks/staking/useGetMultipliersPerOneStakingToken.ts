import abi from '@dappabis/stakex/abi-ui.json'
import { isUndefined } from 'lodash'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetMultipliersPerOneStakingToken = (
    address: Address,
    chainId: number,
    bucketId: Address,
    amount: bigint
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: `getMultipliersPerOneStakingToken`,
        args: [bucketId, amount],
        query: {
            select: (data: any[]) => data,
            enabled: Boolean(address && chainId) && !isUndefined(bucketId),
        },
    })
