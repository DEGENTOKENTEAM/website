import abi from '@dappabis/stakex/abi-ui.json'
import _ from 'lodash'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

type GetFeeFor = 'staking' | 'unstaking' | 'restaking'

export const useGetFeeFor = (
    address: Address,
    chainId: number,
    whatFor: GetFeeFor,
    amount: bigint
) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: `getFeeFor${_.upperFirst(whatFor)}`,
        args: [amount],
        query: {
            select: (data: any[]) => ({
                stakeAmount: data[0],
                feeAmount: data[1],
            }),
            enabled: Boolean(address && chainId && whatFor && amount),
        },
    })
