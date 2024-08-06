import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export const useHasFees = (address: Address, chainId: number) => {
    return useReadContracts({
        contracts: [
            {
                address,
                abi,
                chainId,
                functionName: 'hasFeeForStaking',
            },
            {
                address,
                abi,
                chainId,
                functionName: 'hasFeeForUnstaking',
            },
            {
                address,
                abi,
                chainId,
                functionName: 'hasFeeForRestaking',
            },
        ],
        query: {
            select: ([
                hasFeeForStaking,
                hasFeeForUnstaking,
                hasFeeForRestaking,
            ]) => ({
                hasFeeForStaking: hasFeeForStaking.result,
                hasFeeForUnstaking: hasFeeForUnstaking.result,
                hasFeeForRestaking: hasFeeForRestaking.result,
            }),
        },
    })
}
