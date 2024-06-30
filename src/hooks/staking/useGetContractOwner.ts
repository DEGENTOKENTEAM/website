import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetContractOwner = (address: Address) =>
    useReadContract({
        address,
        abi,
        functionName: 'contractOwner',
        query: {
            select: (data: Address) => data,
        },
    })
