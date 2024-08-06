import abi from '@dappabis/stakex/abi-ui.json'
import { RewardEstimation } from '@dapptypes'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

type StakingData = {
    staked: RewardEstimation
    stakedBurned: RewardEstimation
    injected: RewardEstimation[]
    rewarded: RewardEstimation[]
    avgLock: bigint
    stakes: bigint
    totalSupply: bigint
    stakesBurned: bigint
}

export const useGetStakingData = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'getStakingData',
        query: {
            select: (data: StakingData) => data,
            enabled: Boolean(address && chainId),
        },
    })
