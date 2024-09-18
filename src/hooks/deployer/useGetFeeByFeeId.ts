import abi from '@dappabis/deployer/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetFeeByFeeId = (
    address: Address,
    chainId: number,
    feeId: Address
) =>
    useReadContract({
        abi,
        address,
        chainId,
        args: [feeId],
        functionName: 'deployerGetFee',
        query: {
            enabled: Boolean(feeId),
            select: (data: { fee: bigint; receiver: Address }) => data,
        },
    })
