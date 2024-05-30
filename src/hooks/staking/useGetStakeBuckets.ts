import abi from '@dappabis/stakex/abi-ui.json'
import { StakeBucket, StakeBucketDataResponse } from '@dapptypes'
import BigNumber from 'bignumber.js'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetStakeBuckets = (address: Address) => {
    return useReadContract({
        address,
        abi,
        query: {
            select: (data: StakeBucketDataResponse[]) => {
                const smallestShare = Array(...data)
                    .sort((a, b) => (a.share < b.share ? -1 : 1))
                    .shift()?.share

                if (!smallestShare) return []

                return Array(...data)
                    .filter(({ active }) => active)
                    .reduce<StakeBucket[]>(
                        (acc, res) => [
                            ...acc,
                            {
                                id: res.id,
                                duration: BigNumber(
                                    res.lock.toString()
                                ).toNumber(),
                                burn: res.burn,
                                active: false,
                                multiplier: parseInt(
                                    (res.share / smallestShare).toString()
                                ),
                            },
                        ],
                        []
                    )
            },
        },
        functionName: 'getStakeBuckets',
    })
}
