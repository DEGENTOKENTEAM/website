import abi from '@dappabis/stakex/abi-ui.json'
import { StakeBucket, StakeBucketDataResponse } from '@dapptypes'
import BigNumber from 'bignumber.js'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetStakeBuckets = (
    address: Address,
    chainId: number,
    all?: boolean
) => {
    return useReadContract({
        address,
        chainId,
        abi,
        functionName: 'getStakeBuckets',
        query: {
            select: (data: StakeBucketDataResponse[]) => {
                const smallestShare = Array(...data)
                    .sort((a, b) => (a.share < b.share ? -1 : 1))
                    .shift()?.share

                if (!smallestShare) return []

                return Array(...data)
                    .filter(({ active }) => all || active)
                    .reduce<StakeBucket[]>(
                        (acc, res) => [
                            ...acc,
                            {
                                id: res.id,
                                duration: BigNumber(
                                    res.lock.toString()
                                ).toNumber(),
                                burn: res.burn,
                                active: res.active,
                                multiplier: parseInt(
                                    (res.share / smallestShare).toString()
                                ),
                                share: Number(res.share),
                                staked: res.staked,
                            },
                        ],
                        []
                    )
            },
            enabled: Boolean(address && chainId),
        },
    })
}
