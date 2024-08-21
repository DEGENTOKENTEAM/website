import abi from '@dappabis/deployer/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

type ReferrerData = {
    account: Address
    active: boolean
    activeUntil: number
    referrerId: Address
    share: number
}

export const useGetReferrerById = (
    address: Address,
    chainId: number,
    referrerId: Address /* bytes32 */
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'deployerGetReferrerById',
        args: [referrerId],
        query: {
            select: (data: ReferrerData) => data,
            enabled: Boolean(address && chainId && referrerId),
        },
    })
