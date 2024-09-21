import abi from '@dappabis/deployer/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useDeployerGetFeeIdSTAKEX = (address: Address, chainId: number) =>
    useReadContract({
        abi,
        address,
        chainId,
        functionName: 'deployerStakeXGetFeeId',
        query: {
            select: (data: Address) => data,
        },
    })
