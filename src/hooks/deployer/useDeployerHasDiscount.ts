import abi from '@dappabis/deployer/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useDeployerHasDiscount = (
    address: Address,
    chainId: number,
    feeId: Address,
    issuer: Address
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'deployerHasDiscount',
        args: [feeId, issuer],
        query: {
            enabled: Boolean(feeId && issuer),
            select: (data: boolean) => data,
        },
    })
