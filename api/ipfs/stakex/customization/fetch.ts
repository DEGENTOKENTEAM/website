import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBHelper } from '../../../helpers/ddb/dynamodb'
import { createReturn } from '../../../helpers/return'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { protocol } = event.pathParameters || {}
    const db = new DynamoDBHelper({ region: 'eu-west-1' })

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

    if (!data.Items || data.Items.length === 0)
        return createReturn(200, JSON.stringify({}))

    return createReturn(
        200,
        JSON.stringify({
            data: {
                logoUrl: `https://ipfs.io/ipfs/${
                    data.Items.at(0)!.imageIpfs.IpfsHash
                }`,
                stylesUrl: `https://ipfs.io/ipfs/${
                    data.Items.at(0)!.stylesIpfs.IpfsHash
                }`,
            },
        })
    )
}
