import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { BatchWriteCommandInput } from '@aws-sdk/lib-dynamodb'
import { toLower } from 'lodash'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'

export type StakeXStakeLogsDTO = {
    chainId: number
    protocol: string
    blockNumber: number
    staked: bigint
    timestamp: number
}

export type StakeXStakeLogsResponse = {
    pkey: string
    skey: string
} & StakeXStakeLogsDTO

type RepositoryContructorOptions = {
    dynamoDBConfig: DynamoDBClientConfig
} & any

const pkey = 'v_1'
const region = 'eu-west-1'
const TableName = process.env.DB_TABLE_NAME_STAKEX_STAKE_LOGS!

export class StakeXStakeLogsRepository {
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

    createBatch = async (data: StakeXStakeLogsDTO[]) => {
        const items = data.map((item) => ({
            pkey,
            skey: `${item.chainId}#${toLower(item.protocol)}#${item.timestamp}`,
            ...item,
        })) as StakeXStakeLogsResponse[]
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

    getAll = async (protocol: string) => {
        const { Items, Count } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression:
                '#pkey = :pkey AND begins_with(#skey, :skey)',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skey': `${protocol}#`,
            },
            ScanIndexForward: true,
        })
        return Count && Items ? (Items as any[]) : []
    }

    getMostRecent = async (chainId: number, protocol: string) => {
        const { Items, Count } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression:
                '#pkey = :pkey AND begins_with(#skey, :skey)',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skey': `${chainId}#${toLower(protocol)}#`,
            },
            ConsistentRead: true,
            ScanIndexForward: false,
        })
        return Count && Items ? (Items[0] as StakeXStakeLogsResponse) : null
    }
}
