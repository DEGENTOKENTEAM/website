import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import fetch from 'node-fetch'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'
import { createReturn } from '../helpers/return'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { network, pairAddress } = event.pathParameters || {}
    const PairKey = `${network}#${pairAddress}`
    const db = new DynamoDBHelper({ region: 'eu-west-1' })

    const resultRaw = await fetch(
        `https://api.dexscreener.com/latest/dex/pairs/${network}/${pairAddress}`
    )

    let result = (await resultRaw.json()) as any

    // read from cache
    if (!result?.pair) {
        const _dbResult = await db.query({
            TableName: process.env.DB_TABLE_NAME_DEXSCREENER_PAIR_CACHE,
            KeyConditionExpression: `#PairKey = :PairKey`,
            ExpressionAttributeNames: {
                [`#PairKey`]: `PairKey`,
            },
            ExpressionAttributeValues: {
                [`:PairKey`]: PairKey,
            },
            ConsistentRead: true,
        })
        if (_dbResult.Items && _dbResult.Items.length >= 1) {
            result = _dbResult.Items[0]
        }
    }

    if (result.pairs) {
        // write to cache
        await db.batchWrite({
            RequestItems: {
                [process.env.DB_TABLE_NAME_DEXSCREENER_PAIR_CACHE!]: [
                    {
                        PutRequest: {
                            Item: {
                                PairKey,
                                result,
                            },
                        },
                    },
                ],
            },
        })
    }

    return createReturn(200, JSON.stringify(result))
}
