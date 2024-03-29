import { useContractRead } from 'wagmi'

import BigNumber from 'bignumber.js'
import abi from '../../abi/degenAtm.json'
import { ATM_ADDRESS } from '../../constants'
import { AtmStatsLoading } from '../../types'

export type DngxAtmStatsForQualifier = {
    isWhitelisted: boolean
    hasClaimed: boolean
    hasLocked: boolean
    tokenBalance: BigNumber
    lockedAmount: BigNumber
    claimedAmount: BigNumber
    totalDeposited: BigNumber
    currentRewardAmount: BigNumber
    currentPenaltyAmount: BigNumber
    currentRewardAmountNet: BigNumber
    estimatedTotalRewardAmount: BigNumber
    estimatedTotalClaimAmount: BigNumber
    loading: 'no'
}

export const useAtmStatsForQualifier = (
    address: string
): DngxAtmStatsForQualifier | AtmStatsLoading => {
    const { data } = useContractRead({
        address: ATM_ADDRESS,
        abi,
        functionName: 'getStatsForQualifier',
        args: [address],
        watch: true,
    })

    if (!data) {
        return { loading: 'yes' }
    }

    return {
        isWhitelisted: data[0],
        hasClaimed: data[1],
        hasLocked: data[2],
        tokenBalance: new BigNumber(data[3].toString()),
        lockedAmount: new BigNumber(data[4].toString()),
        claimedAmount: new BigNumber(data[5].toString()),
        totalDeposited: new BigNumber(data[6].toString()),
        currentRewardAmount: new BigNumber(data[7].toString()),
        currentPenaltyAmount: new BigNumber(data[8].toString()),
        currentRewardAmountNet: new BigNumber(data[9].toString()),
        estimatedTotalRewardAmount: new BigNumber(data[10].toString()),
        estimatedTotalClaimAmount: new BigNumber(data[11].toString()),
        loading: 'no',
    }
}
