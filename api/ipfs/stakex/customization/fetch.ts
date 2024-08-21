import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBHelper } from '../../../helpers/ddb/dynamodb'
import { createReturn } from '../../../helpers/return'
import { StakeXCustomizationResponseType } from './../../../../types/stakex'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { protocol } = event.pathParameters || {}
    const db = new DynamoDBHelper({ region: 'eu-west-1' })

    const baseResponse = {
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

    if (!data.Items || data.Items.length === 0)
        return createReturn(200, JSON.stringify(baseResponse))

    const logoUrlUpdatePending = Boolean(data.Items.at(0)!.logoIpfsNew)
    const stylesUrlUpdatePending = Boolean(data.Items.at(0)!.stylesIpfsNew)

    return createReturn(
        200,
        JSON.stringify({
            ...baseResponse,
            data: {
                ...baseResponse.data,
                projectName: data.Items.at(0)!.projectName,
                logoUrl: data.Items.at(0)!.logoIpfs
                    ? `https://ipfs.io/ipfs/${data.Items.at(0)!.logoIpfs}`
                    : baseResponse.data.logoUrl,
                logoUrlUpdatePending:
                    logoUrlUpdatePending ??
                    baseResponse.data.logoUrlUpdatePending,
                stylesUrl: data.Items.at(0)!.stylesIpfs
                    ? `https://ipfs.io/ipfs/${data.Items.at(0)!.stylesIpfs}`
                    : baseResponse.data.stylesUrl,
                stylesUrlUpdatePending:
                    stylesUrlUpdatePending ??
                    baseResponse.data.stylesUrlUpdatePending,
            },
        } as StakeXCustomizationResponseType)
    )
}
