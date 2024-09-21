import abi from '@dappabis/deployer/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export enum DiscountType {
    NULL,
    PERCENTAGE,
    ABSOLUTE,
}
export const useDeployerGetDiscount = (
    address: Address,
    chainId: number,
    feeId: Address,
    issuer: Address,
    enabled: boolean
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'deployerGetDiscount',
        args: [feeId, issuer],
        query: {
            enabled: Boolean(feeId && issuer && enabled),
            select: (data: {
                issuer: Address
                feeId: Address
                discountType: DiscountType
                discountValue: bigint
            }) => data,
        },
    })
