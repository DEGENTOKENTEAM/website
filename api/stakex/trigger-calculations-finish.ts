import { UpdateCommandInput } from '@aws-sdk/lib-dynamodb'
import { Handler } from 'aws-lambda'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'

export const handler: Handler = async (event, _, callback) => {
    const { chainId, protocol, blockNumberAPUpdate, blockNumberStakesUpdate } =
        event.responsePayload

    const PARTITION_VERSION = 'v_1'

    let data: any = {}
    if (blockNumberAPUpdate) data = { ...data, blockNumberAPUpdate }
    if (blockNumberStakesUpdate) data = { ...data, blockNumberStakesUpdate }

    // atomic update
    const dataKeys = Object.keys(data)

    if (!dataKeys.length) return callback(null, true)

    const db = new DynamoDBHelper({ region: 'eu-west-1' })
    const updateCommand: UpdateCommandInput = {
        TableName: process.env.DB_TABLE_NAME_STAKEX_PROTOCOLS,
        Key: {
            pkey: PARTITION_VERSION,
            skey: `${chainId}#${protocol}`,
        },
        UpdateExpression: `SET ${dataKeys
            .map((_, index) => `#field${index} = :value${index}`)
            .join(', ')}`,
        ExpressionAttributeNames: dataKeys.reduce(
            (accumulator, k, index) => ({
                ...accumulator,
                [`#field${index}`]: k,
            }),
            {}
        ),
        ExpressionAttributeValues: dataKeys.reduce(
            (accumulator, k, index) => ({
                ...accumulator,
                [`:value${index}`]: data[k],
            }),
            {}
        ),
    }

    try {
        const update = await db.update(updateCommand)
        return callback(null, update)
    } catch (e) {
        return callback((e as Error).message, false)
    }
}
