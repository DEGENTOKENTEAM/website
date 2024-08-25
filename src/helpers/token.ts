import abi from '@dappabis/erc20.json'
import { readContract } from '@wagmi/core'
import { getChainById } from 'shared/supportedChains'
import { Address, createPublicClient, http } from 'viem'
import { Config } from 'wagmi'

const cachedTokenData: Record<string, [string, string, bigint]> = {}

export const getTokenData = async (chainId: number, address: Address) => {
    if (cachedTokenData[address]) return cachedTokenData[address]
    const chain = getChainById(chainId)
    const client = createPublicClient({ chain, transport: http() })
    const responses = await client.multicall({
        contracts: [
            {
                address,
                abi,
                functionName: 'name',
            },
            {
                address,
                abi,
                functionName: 'symbol',
            },
            {
                address,
                abi,
                functionName: 'decimals',
            },
        ],
    })

    cachedTokenData[address] = [
        responses[0].status == 'success' ? (responses[0].result as string) : '',
        responses[1].status == 'success' ? (responses[1].result as string) : '',
        responses[2].status == 'success' ? (responses[2].result as bigint) : 0n,
    ]

    return cachedTokenData[address]
}
