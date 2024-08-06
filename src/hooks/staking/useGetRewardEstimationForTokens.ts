import abi from '@dappabis/stakex/abi-ui.json'
import { RewardEstimation } from '@dapptypes'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export const useGetRewardEstimationForTokens = (
    address: Address,
    chainId: number,
    tokenIds: bigint[],
    targetToken: Address
) =>
    useReadContracts({
        contracts: tokenIds?.map(
            (tokenId) =>
                ({
                    address,
                    chainId,
                    abi,
                    functionName: 'getRewardEstimationInToken',
                    args: [tokenId, targetToken],
                    name: `tokenId${tokenId}`,
                } as any)
        ),
        query: {
            select: (data) =>
                data
                    ?.filter((data) => data?.status == 'success')
                    .map(
                        (data) =>
                            (data.result as Array<any>)[0] as RewardEstimation
                    ),
            enabled: Boolean(
                address &&
                    chainId &&
                    tokenIds &&
                    tokenIds.length > 0 &&
                    targetToken
            ),
        },
    })
