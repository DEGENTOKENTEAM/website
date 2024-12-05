import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Address, createPublicClient, http } from 'viem'
import { getChainById } from '../../shared/supportedChains'
import { createReturn } from '../helpers/return'
import abi from './../../src/abi/stakex/abi-ui.json'

type CampaignRequest = {
    chainId: number
    protocol: string
    bucketId: string
}

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const payload = (
        typeof event.body == 'string' ? JSON.parse(event.body) : event.body
    ) as CampaignRequest[]

    const response: any = {}

    if (payload.length) {
        const chains: { [chainId: number]: CampaignRequest[] } = {}
        for (const item of payload) {
            if (!chains[item.chainId]) chains[item.chainId] = []
            chains[item.chainId].push(item)
        }

        for (const chainId of Object.keys(chains)) {
            const client = createPublicClient({
                chain: getChainById(Number(chainId)),
                transport: http(undefined, {
                    fetchOptions: {
                        headers: {
                            'Origin': 'https://dgnx.finance',
                        },
                    },
                }),
            })

            const multicallRequest: any[] = [] as const

            for (const protocol of chains[Number(chainId)]) {
                multicallRequest.push({
                    abi,
                    address: protocol.protocol as Address,
                    functionName: 'stakeXGetCampaignData',
                    args: [protocol.bucketId],
                })
            }

            const results = await client.multicall({
                contracts: [...multicallRequest],
            })

            for (const result of results) {
                if (result.status == 'success')
                    response[(result.result as any).config.bucketId] = (
                        result.result as any
                    ).stats
            }
        }
    }

    return createReturn(
        200,
        JSON.stringify(response, (_, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )
    )
}
