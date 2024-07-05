import { Handler } from 'aws-lambda'
import fetch from 'node-fetch'
import { DynamoDBHelper } from '../../../helpers/ddb/dynamodb'

export const handler: Handler = async (_, __, cb) => {
    const timeout = 5000 // 5s
    const db = new DynamoDBHelper({ region: 'eu-west-1' })
    const abortCtrl = new AbortController()

    const data = await db.scan({
        TableName: process.env.DB_TABLE_NAME_STAKEX_CUSTOMIZATION,
        ExpressionAttributeNames: {
            [`#attr`]: `logoIpfsNew`,
        },
        FilterExpression: 'attribute_exists(#attr)',
        Select: 'ALL_ATTRIBUTES',
    })

    if (data.Count === 0) return

    for (const item of data.Items!) {
        const timeoutId = setTimeout(() => abortCtrl.abort(), timeout)
        const logoUrl = `https://ipfs.io/ipfs/${item.logoIpfsNew}`
        const response = await fetch(logoUrl, { signal: abortCtrl.signal })
        clearTimeout(timeoutId)

        const newItem: any = {
            ...item,
            logoIpfs: item.logoIpfsNew,
            logoIpfsNew: null,
        }

        if (response.status === 200) {
            await new DynamoDBHelper({ region: 'eu-west-1' }).batchWrite({
                RequestItems: {
                    [process.env.DB_TABLE_NAME_STAKEX_CUSTOMIZATION!]: [
                        {
                            PutRequest: {
                                Item: newItem,
                            },
                        },
                    ],
                },
            })
        }
    }
}
