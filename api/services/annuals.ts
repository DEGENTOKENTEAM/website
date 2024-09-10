import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'

type StakeXAnnualsCreateDTO = {
    protocol: string
    bucketId: string
    blockNumber: number
    apr: number
    apy: number
    fromBlock: number
    toBlock: number
    timestamp: number
}

type StakeXAnnualsUpdateDTO = {
    blockNumber: number
    apr: number
    apy: number
    fromBlock: number
    toBlock: number
    timestamp: number
}

type StakeXAnnualsCreateResponse = {
    pkey: string
    skey: string
} & StakeXAnnualsCreateDTO

type StakeXAnnualsUpdateResponse = {
    pkey: string
    skey: string
    protocol: string
    bucketId: string
    blockNumber: number
} & StakeXAnnualsUpdateDTO

type RepositoryContructorOptions = {
    dynamoDBConfig: DynamoDBClientConfig
} & any

const pkey = 'v_1'
const region = 'eu-west-1' // TODO update this little shit here
const TableName = process.env.DB_TABLE_NAME_STAKEX_ANNUAL_PERCENTAGE_LOGS!

export class StakeXAnnualsRepository {
    options: RepositoryContructorOptions
    _db: DynamoDBHelper

    constructor(_options?: RepositoryContructorOptions) {
        this.options = {
            dynamoDBConfig: {
                params: { TableName },
                region,
            },
            ...(_options || {}),
        }
        this._db = new DynamoDBHelper(this.options.dynamoDBConfig)
    }

    // create = async (data: StakeXAnnualsCreateDTO) => {
    //     const itemKeys = Object.keys(data)
    //     const itemData = {
    //         pkey,
    //         skey: `${data.protocol}#${data.bucketId}#${data.blockNumber}`,
    //         ...itemKeys.reduce(
    //             (accumulator, k) => ({
    //                 ...accumulator,
    //                 [k]: (data as any)[k],
    //             }),
    //             {}
    //         ),
    //     } as StakeXAnnualsCreateResponse
    //     await this._db.create({
    //         TableName: this.options.dynamoDBConfig.params.TableName,
    //         Item: itemData,
    //     })
    //     return itemData
    // }

    getByProtocolAndBlockNumber = async (
        protocol: string,
        blockNumber: number
    ) => {
        const { Items, Count, LastEvaluatedKey } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression:
                '#pkey = :pkey AND begins_with(#skey, :skeyBegin)',
            FilterExpression: '#blockNumber = :blockNumber',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
                '#blockNumber': 'blockNumber',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skeyBegin': `${protocol}#`,
                ':blockNumber': blockNumber,
            },
        })
        return {
            items: Items || [],
            count: Count || 0,
            lastEvaluatedKey: LastEvaluatedKey || null,
        }
    }

    getAll = async (size = 10, lastEvaluatedKey?: any) => {
        if (lastEvaluatedKey)
            lastEvaluatedKey = JSON.parse(decodeURIComponent(lastEvaluatedKey))

        const { Items, Count, LastEvaluatedKey } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression: '#pkey = :pkey',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
            },
            ConsistentRead: true,
            ScanIndexForward: false,
            ExclusiveStartKey: lastEvaluatedKey ? lastEvaluatedKey : undefined,
            Limit: size,
        })
        return {
            items: Items,
            count: Count,
            lastEvaluatedKey: LastEvaluatedKey,
        }
    }
}
