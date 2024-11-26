import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { BatchWriteCommandInput } from '@aws-sdk/lib-dynamodb'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'
import { toLower } from 'lodash'

export type StakeXAnnualsCreateDTO = {
    chainId: number
    protocol: string
    bucketId: string
    timestamp: number
    apr: number
    apy: number
    fromBlock: number
    toBlock: number
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
} & Partial<StakeXAnnualsCreateDTO>

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
const region = 'eu-west-1'
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

    createBatch = async (data: StakeXAnnualsCreateDTO[]) => {
        const items = data.map((item) => ({
            pkey,
            skey: `${item.chainId}#${toLower(item.protocol)}#${item.bucketId}#${
                item.timestamp
            }`,
            ...item,
        })) as StakeXAnnualsCreateResponse[]
        const itemsBatch: BatchWriteCommandInput = {
            RequestItems: {
                [this.options.dynamoDBConfig.params.TableName]: items.map(
                    (Item) => ({
                        PutRequest: {
                            Item,
                        },
                    })
                ),
            },
        }
        await this._db.batchWrite(itemsBatch)
        return items
    }

    getLatestByBlockNumber = async (
        chainId: number,
        protocol: string,
        blockNumber: number
    ) => {
        const { Items, Count, LastEvaluatedKey } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression:
                '#pkey = :pkey AND begins_with(#skey, :skeyBegin)',
            FilterExpression: '#toBlock = :toBlock',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
                '#toBlock': 'toBlock',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skeyBegin': `${chainId}#${toLower(protocol)}#`,
                ':toBlock': blockNumber,
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

    getMostRecentBucket = async (protocol: string, bucketId: string) => {
        const { Count, Items } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression:
                '#pkey = :pkey AND begins_with(#skey, :skey)',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skey': `${toLower(protocol)}#${bucketId}#`,
            },
            ScanIndexForward: false,
            Limit: 1,
        })

        return Count && Items ? Items[0] : null
    }
}
