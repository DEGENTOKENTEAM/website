import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Address, createPublicClient, http } from 'viem'
import { getChainById } from '../../../../shared/supportedChains'
import { TokenInfoResponse } from '../../../../src/types'
import { DynamoDBHelper } from '../../../helpers/ddb/dynamodb'
import { createReturn } from '../../../helpers/return'
import abi from './../../../../src/abi/stakex/abi-ui.json'
import { StakeXCustomizationResponseType } from './../../../../types/stakex'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { protocol, chainId: chainIdOrig } = event.pathParameters || {}
    const chainId = Number(chainIdOrig)
    const db = new DynamoDBHelper({ region: 'eu-west-1' })

    let response: StakeXCustomizationResponseType = {
        data: {
            projectName: null,
            logoUrl: null,
            logoUrlUpdatePending: false,
            stylesUrl: null,
            stylesUrlUpdatePending: false,
        },
    }

    const data = await db.query({
        TableName: process.env.DB_TABLE_NAME_STAKEX_CUSTOMIZATION,
        KeyConditionExpression: `#CustomizationKey = :CustomizationKey`,
        ExpressionAttributeNames: {
            [`#CustomizationKey`]: `CustomizationKey`,
        },
        ExpressionAttributeValues: {
            [`:CustomizationKey`]: protocol,
        },
        ConsistentRead: true,
    })

    if (data.Items && data.Items.length > 0) {
        const projectName = data.Items.at(0)!.projectName
            ? data.Items.at(0)!.projectName
            : null
        const logoUrlUpdatePending = Boolean(data.Items.at(0)!.logoIpfsNew)
        const logoUrl = data.Items.at(0)!.logoIpfs
            ? `https://ipfs.io/ipfs/${data.Items.at(0)!.logoIpfs}`
            : null

        const stylesUrlUpdatePending = Boolean(data.Items.at(0)!.stylesIpfsNew)
        const stylesUrl = data.Items.at(0)!.stylesIpfs
            ? `https://ipfs.io/ipfs/${data.Items.at(0)!.stylesIpfs}`
            : null

        response.data = {
            ...response.data,
            projectName,
            logoUrlUpdatePending,
            logoUrl,
            stylesUrlUpdatePending,
            stylesUrl,
        }
    }

    if (!response.data.logoUrl || !response.data.projectName) {
        const chain = getChainById(chainId)

        if (!chain)
            return createReturn(
                403,
                JSON.stringify({ message: 'chain not supported' })
            )

        const client = createPublicClient({ chain, transport: http() })

        let stakingTokenData: TokenInfoResponse | null = null

        try {
            stakingTokenData = (await client.readContract({
                abi,
                address: protocol as Address,
                functionName: 'getStakingToken',
            })) as TokenInfoResponse
        } catch (e) {}

        if (!stakingTokenData)
            return createReturn(
                404,
                JSON.stringify({ message: 'protocol not available' })
            )

        if (!response.data.projectName)
            response.data.projectName = `${stakingTokenData.symbol} staking`

        if (!response.data.logoUrl) {
            const lambdaClient = new LambdaClient()
            const invokeCoingeckoResponse = await lambdaClient.send(
                new InvokeCommand({
                    FunctionName: process.env.LAMBDA_COINGECKO_NAME,
                    Payload: JSON.stringify({
                        pathParameters: {
                            proxyPath: `api/v3/coins/id/contract/${stakingTokenData.source}`,
                        },
                    }),
                })
            )
            const cgdata = JSON.parse(
                JSON.parse(
                    new TextDecoder().decode(invokeCoingeckoResponse.Payload)
                ).body
            )
            if (cgdata && cgdata.image && cgdata.image.large)
                response.data.logoUrl = cgdata.image.large
        }
    }

    return createReturn(200, JSON.stringify(response))
}
