import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import {
    BatchWriteCommandInput,
    UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { Address } from 'viem'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'
import { toLower } from 'lodash'

export type StakeXProtocolsDTO = {
    chainId: number
    protocol: string
    timestamp: number
    isCampaignMode: boolean
    blockNumberCreated: number
    blockNumberEnabled: number
    blockNumberLastUpdate: number
    blockNumberAPUpdate: number
    blockNumberStakesUpdate: number
    blockNumberAPPeriod: number
    blockNumberCampaignsUpdate: number
    owner: string
}

export type StakeXProtocolsLastUpdateDTO = {
    chainId: number
    protocol: string
    blockNumberLastUpdate: number
} & Partial<StakeXProtocolsDTO>

export type StakeXProtocolsStakesUpdateDTO = {
    chainId: number
    protocol: string
    blockNumberStakesUpdate: number
} & Partial<StakeXProtocolsDTO>

export type StakeXProtocolsAPUpdateDTO = {
    chainId: number
    protocol: string
    blockNumberAPUpdate: number
} & Partial<StakeXProtocolsDTO>

export type StakeXProtocolsResponse = {
    pkey: string
    skey: string
} & (StakeXProtocolsDTO | StakeXProtocolsLastUpdateDTO)

type RepositoryContructorOptions = {
    dynamoDBConfig: DynamoDBClientConfig
} & any

const pkey = 'v_1'
const region = 'eu-west-1'
const TableName = process.env.DB_TABLE_NAME_STAKEX_PROTOCOLS!

export class StakeXProtocolsRepository {
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

    createBatch = async (data: StakeXProtocolsDTO[]) => {
        const items = data.map((item) => ({
            pkey,
            skey: `${item.chainId}#${toLower(item.protocol)}`,
            ...item,
        })) as StakeXProtocolsResponse[]
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

    update = async (
        data:
            | StakeXProtocolsLastUpdateDTO
            | StakeXProtocolsStakesUpdateDTO
            | StakeXProtocolsAPUpdateDTO
    ) => {
        const itemKeys = Object.keys(data)
        const Key = {
            pkey,
            skey: `${data.chainId}#${data.protocol}`,
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
        return { ...Key, ...data } as StakeXProtocolsResponse
    }

    get = async (chainId: number, protcol: string) => {
        const { Items, Count } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression: '#pkey = :pkey AND #skey = :skey',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skey': `${chainId}#${toLower(protcol)}`,
            },
            Limit: 1,
        })
        return Count && Items ? (Items[0] as StakeXProtocolsResponse) : null
    }

    getAllByChainId = async (
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
            items: (Items || []) as StakeXProtocolsResponse[],
            count: Count || 0,
            lastEvaluatedKey: LastEvaluatedKey || null,
        }
    }

    getAllRegulars = async (size = 10, lastEvaluatedKey?: any) => {
        if (lastEvaluatedKey)
            lastEvaluatedKey = JSON.parse(decodeURIComponent(lastEvaluatedKey))

        const { Items, Count, LastEvaluatedKey } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression: '#pkey = :pkey',
            FilterExpression: '#isCampaignMode = :isCampaignMode',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#isCampaignMode': 'isCampaignMode',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':isCampaignMode': false,
            },
            ConsistentRead: true,
            ScanIndexForward: false,
            ExclusiveStartKey: lastEvaluatedKey ? lastEvaluatedKey : undefined,
            Limit: size,
        })
        return {
            items: (Items || []) as StakeXProtocolsResponse[],
            count: Count || 0,
            lastEvaluatedKey: LastEvaluatedKey || null,
        }
    }

    getAllCampaignsByChainId = async (
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
            FilterExpression: '#isCampaignMode = :isCampaignMode',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
                '#isCampaignMode': 'isCampaignMode',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skeyBegin': `${chainId}#`,
                ':isCampaignMode': true,
            },
            ConsistentRead: true,
            ScanIndexForward: false,
            ExclusiveStartKey: lastEvaluatedKey ? lastEvaluatedKey : undefined,
            Limit: size,
        })
        return {
            items: (Items || []) as StakeXProtocolsResponse[],
            count: Count || 0,
            lastEvaluatedKey: LastEvaluatedKey || null,
        }
    }

    getAllRegularsByChainId = async (
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
            FilterExpression: '#isCampaignMode = :isCampaignMode',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
                '#isCampaignMode': 'isCampaignMode',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skeyBegin': `${chainId}#`,
                ':isCampaignMode': false,
            },
            ConsistentRead: true,
            ScanIndexForward: false,
            ExclusiveStartKey: lastEvaluatedKey ? lastEvaluatedKey : undefined,
            Limit: size,
        })
        return {
            items: (Items || []) as StakeXProtocolsResponse[],
            count: Count || 0,
            lastEvaluatedKey: LastEvaluatedKey || null,
        }
    }

    getAllRegularsByOwnerAddress = async (owner: Address) => {
        const { Items, Count } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression: '#pkey = :pkey',
            FilterExpression:
                '#isCampaignMode = :isCampaignMode AND #owner = :owner',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#isCampaignMode': 'isCampaignMode',
                '#owner': 'owner',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':isCampaignMode': false,
                ':owner': toLower(owner),
            },
            ConsistentRead: true,
            ScanIndexForward: false,
        })
        return {
            items: (Items || []) as StakeXProtocolsResponse[],
            count: Count || 0,
        }
    }

    getAllCampaignsByOwnerAddress = async (owner: Address) => {
        const { Items, Count } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression: '#pkey = :pkey',
            FilterExpression:
                '#isCampaignMode = :isCampaignMode AND #owner = :owner',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#isCampaignMode': 'isCampaignMode',
                '#owner': 'owner',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':isCampaignMode': true,
                ':owner': toLower(owner),
            },
            ConsistentRead: true,
            ScanIndexForward: false,
        })
        return {
            items: (Items || []) as StakeXProtocolsResponse[],
            count: Count || 0,
        }
    }
}
