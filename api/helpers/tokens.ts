import fetch from 'node-fetch'
import { Address } from 'viem'

const amountCache: {
    [chainId: number]: { [tokenAddress: Address]: bigint }
} = {}

export const getTokensForOneToken = async (
    chainId: number,
    token: Address,
    oneToken: Address
): Promise<bigint> => {
    if (amountCache[chainId] && amountCache[chainId][token])
        return amountCache[chainId][token]

    const response = await fetch(
        `https://open-api.openocean.finance/v4/${chainId}/quote?inTokenAddress=${oneToken}&outTokenAddress=${token}&amount=1&gasPrice=1`
    )
    const jsonResponse: any = await response.json()

    if (!amountCache[chainId]) amountCache[chainId] = {}

    if (!amountCache[chainId][token]) amountCache[chainId][token] = 0n

    if (jsonResponse.data && jsonResponse.data.outAmount)
        amountCache[chainId][token] = BigInt(jsonResponse.data.outAmount)

    return amountCache[chainId][token]
}
