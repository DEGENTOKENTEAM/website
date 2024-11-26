import abi from '@dappabis/stakex/abi-ui.json'
import { isBoolean, isUndefined } from 'lodash'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetAddingUpEstimation = (
    address: Address,
    chainId: number,
    tokenId: bigint,
    amount: bigint,
    includeRewards: boolean,
    targetToken: Address
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'stakeXGetAddingUpEstimation',
        args: [{ tokenId, amount, includeRewards, targetToken }],
        query: {
            select: ([stakeAmount, targetAmount]: [bigint, bigint]) => ({
                stakeAmount,
                targetAmount,
            }),
            enabled: Boolean(
                address &&
                    chainId &&
                    tokenId &&
                    !isUndefined(amount) &&
                    isBoolean(includeRewards) &&
                    targetToken
            ),
        },
    })
