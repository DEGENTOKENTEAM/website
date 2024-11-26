import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { BatchWriteCommandInput } from '@aws-sdk/lib-dynamodb'
import { toLower } from 'lodash'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'

export type StakeXProtocolLogsDTO = {
    chainId: number
    protocol: string
    blockNumber: number
    txHash: string
    logIndex: number
    log: any
}

export type StakeXProtocolLogsResponse = {
    pkey: string
    skey: string
} & StakeXProtocolLogsDTO

type RepositoryContructorOptions = {
    dynamoDBConfig: DynamoDBClientConfig
} & any

const pkey = 'v_1'
const region = 'eu-west-1'
const TableName = process.env.DB_TABLE_NAME_STAKEX_PROTOCOL_LOGS!

export class StakeXProtocolLogsRepository {
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

    createBatch = async (data: StakeXProtocolLogsDTO[]) => {
        const items = data.map((item) => ({
            pkey,
            skey: `${item.chainId}#${toLower(item.protocol)}#${
                item.blockNumber
            }#${item.txHash}#${item.logIndex}`,
            ...item,
        })) as StakeXProtocolLogsResponse[]
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

    getAll = async (
        chainId: number,
        protocol: string,
        size = 100,
        desc = true,
        lastEvaluatedKey?: any
    ) => {
        if (lastEvaluatedKey)
            lastEvaluatedKey = JSON.parse(decodeURIComponent(lastEvaluatedKey))

        const { Items, Count, LastEvaluatedKey } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression:
                '#pkey = :pkey AND begins_with(#skey, :skeyBegin)',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skeyBegin': `${chainId}#${toLower(protocol)}#`,
            },
            ConsistentRead: true,
            ScanIndexForward: !desc,
            ExclusiveStartKey: lastEvaluatedKey ? lastEvaluatedKey : undefined,
            Limit: size,
        })

        return {
            items: (Items || []) as StakeXProtocolLogsResponse[],
            count: Count || 0,
            lastEvaluatedKey: LastEvaluatedKey || null,
        }
    }

    getForProtocolSinceBlockNumber = async (
        chainId: number,
        protocol: string,
        blockNumber: number
    ) => {
        const { Items, Count } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression:
                '#pkey = :pkey AND begins_with(#skey, :skey)',
            FilterExpression: '#blockNumber > :blockNumber',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
                '#blockNumber': 'blockNumber',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skey': `${chainId}#${toLower(protocol)}#`,
                ':blockNumber': blockNumber,
            },
            ConsistentRead: true,
            ScanIndexForward: true,
        })

        return {
            items: (Items || []) as StakeXProtocolLogsResponse[],
            count: Count || 0,
        }
    }
}
