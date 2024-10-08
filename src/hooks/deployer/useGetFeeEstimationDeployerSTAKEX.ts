import abi from '@dappabis/deployer/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetFeeEstimationDeployerSTAKEX = (
    address: Address,
    chainId: number,
    account: Address
) =>
    useReadContract({
        address,
        chainId,
        abi,
        account,
        functionName: 'deployerStakeXGetFeeEstimation',
        query: {
            enabled: Boolean(address && chainId),
            select: (data: bigint) => data,
        },
    })
