import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetContractOwner = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'contractOwner',
        query: {
            select: (data: Address) => data,
            enabled: Boolean(address && chainId),
        },
    })
