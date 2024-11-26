import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import {
    BatchWriteCommandInput,
    UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'
import { Address } from 'viem'
import { toLower } from 'lodash'

export type StakeXCampaignsDTO = {
    chainId: number
    protocol: string
    bucketId: string

    owner: string

    created: number
    opened: number
    started: number
    period: number

    initialRewardAmount: bigint
    rewardAmount: bigint
    rewardSymbol: string
    rewardDecimals: number
    stakingSymbol: string
    stakingDecimals: number
    name: string
}

export type StakeXCampaignsUpdateDTO = {
    chainId: number
    protocol: string
    bucketId: string
} & Partial<StakeXCampaignsDTO>

export type StakeXCampaignsDeleteDTO = {
    chainId: number
    protocol: string
    bucketId: string
}

export type StakeXCampaignsResponse = {
    pkey: string
    skey: string
} & StakeXCampaignsDTO

type RepositoryContructorOptions = {
    dynamoDBConfig: DynamoDBClientConfig
} & any

const pkey = 'v_1'
const region = 'eu-west-1'
const TableName = process.env.DB_TABLE_NAME_STAKEX_CAMPAIGNS!

export class StakeXCampaignsRepository {
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

    createBatch = async (data: StakeXCampaignsDTO[]) => {
        const items = data.map((item) => ({
            pkey,
            skey: `${item.chainId}#${toLower(item.protocol)}#${item.bucketId}`,
            ...item,
        })) as StakeXCampaignsResponse[]
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

    update = async (data: StakeXCampaignsUpdateDTO) => {
        const itemKeys = Object.keys(data)
        const Key = {
            pkey,
            skey: `${data.chainId}#${toLower(data.protocol)}#${data.bucketId}`,
        }
        const params: UpdateCommandInput = {
            TableName: this.options.dynamoDBConfig.params.TableName,
            Key,
            UpdateExpression: `SET ${itemKeys
                .map((_, index) => `#field${index} = :value${index}`)
                .join(', ')}`,
            ExpressionAttributeNames: itemKeys.reduce(
                (accumulator, k, index) => ({
                    ...accumulator,
                    [`#field${index}`]: k,
                }),
                {}
            ),
            ExpressionAttributeValues: itemKeys.reduce(
                (accumulator, k, index) => ({
                    ...accumulator,
                    [`:value${index}`]: (data as any)[k],
                }),
                {}
            ),
        }
        await this._db.update(params)
        return { ...Key, ...data } as StakeXCampaignsResponse
    }

    deleteBatch = async (data: StakeXCampaignsDeleteDTO[]) => {
        const itemsBatch: BatchWriteCommandInput = {
            RequestItems: {
                [this.options.dynamoDBConfig.params.TableName]: data.map(
                    (item) => ({
                        DeleteRequest: {
                            Key: {
                                pkey,
                                skey: `${item.chainId}#${toLower(
                                    item.protocol
                                )}#${item.bucketId}`,
                            },
                        },
                    })
                ),
            },
        }
        const ret = await this._db.batchWrite(itemsBatch)
        return ret
    }

    list = async (size = 10, lastEvaluatedKey?: any) => {
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
            items: (Items || []) as StakeXCampaignsResponse[],
            count: Count || 0,
            lastEvaluatedKey: LastEvaluatedKey || null,
        }
    }

    listByChainId = async (
        chainId: number,
        size = 10,
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
                ':skeyBegin': `${chainId}#`,
            },
            ConsistentRead: true,
            ScanIndexForward: false,
            ExclusiveStartKey: lastEvaluatedKey ? lastEvaluatedKey : undefined,
            Limit: size,
        })
        return {
            items: (Items || []) as StakeXCampaignsResponse[],
            count: Count || 0,
            lastEvaluatedKey: LastEvaluatedKey || null,
        }
    }

    listByChainIdAndProtocol = async (
        chainId: number,
        protocol: string,
        size = 10,
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
            ScanIndexForward: false,
            ExclusiveStartKey: lastEvaluatedKey ? lastEvaluatedKey : undefined,
            Limit: size,
        })
        return {
            items: (Items || []) as StakeXCampaignsResponse[],
            count: Count || 0,
            lastEvaluatedKey: LastEvaluatedKey || null,
        }
    }

    listByOwner = async (owner: Address) => {
        const { Items, Count } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression: '#pkey = :pkey',
            FilterExpression: '#owner = :owner',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#owner': 'owner',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':owner': toLower(owner),
            },
            ConsistentRead: true,
            ScanIndexForward: false,
        })
        return {
            items: (Items || []) as StakeXCampaignsResponse[],
            count: Count || 0,
        }
    }
}
