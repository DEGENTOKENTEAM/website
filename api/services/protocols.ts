import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import {
    BatchWriteCommandInput,
    UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'

export type StakeXProtocolsDTO = {
    chainId: number
    protocol: string
    timestamp: number
    blockNumberCreated: number
    blockNumberEnabled: number
    blockNumberAPUpdate: number
    blockNumberStakesUpdate: number
    blockNumberAPUpdateIntervall: number
    blockNumberAPPeriod: number
}
export type StakeXProtocolsResponse = {
    pkey: string
    skey: string
} & StakeXProtocolsDTO

type RepositoryContructorOptions = {
    dynamoDBConfig: DynamoDBClientConfig
} & any

const pkey = 'v_1'
const region = 'eu-west-1' // TODO update this little shit here
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
            ..._options,
        }
        this._db = new DynamoDBHelper(this.options.dynamoDBConfig)
    }

    createBatch = async (data: StakeXProtocolsDTO[]) => {
        const items = data.map((item) => ({
            pkey,
            skey: `${item.chainId}#${item.protocol}`,
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

    update = async (data: StakeXProtocolsDTO) => {
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

    // getByChainId = async (chainId: number, lastEvaluatedKey?: any) => {
    //     const { Items, Count, LastEvaluatedKey } = await this._db.query({
    //         TableName: this.options.dynamoDBConfig.params.TableName,
    //         KeyConditionExpression:
    //             '#pkey = :pkey AND begins_with(#skey, :skey)',
    //         ExpressionAttributeNames: {
    //             '#pkey': 'pkey',
    //             '#skey': 'skey',
    //         },
    //         ExpressionAttributeValues: {
    //             ':pkey': pkey,
    //             ':skey': `${chainId}#`,
    //         },
    //         ConsistentRead: true,
    //         ScanIndexForward: false,
    //         Limit: 1,
    //     })
    //     return {
    //         items: Items,
    //         count: Count,
    //         lastEvaluatedKey: LastEvaluatedKey,
    //     }
    // }

    // getByChainIdAndProtocol = async (chainId: number, protocol: string) =>
    //     (
    //         await this._db.query({
    //             TableName: this.options.dynamoDBConfig.params.TableName,
    //             KeyConditionExpression: '#pkey = :pkey AND #skey = :skey',
    //             ExpressionAttributeNames: {
    //                 '#pkey': 'pkey',
    //                 '#skey': 'skey',
    //             },
    //             ExpressionAttributeValues: {
    //                 ':pkey': pkey,
    //                 ':skey': `${chainId}#${protocol}`,
    //             },
    //             ConsistentRead: true,
    //             ScanIndexForward: false,
    //             Limit: 1,
    //         })
    //     ).Items ?? null

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
            items: Items || [],
            count: Count || 0,
            lastEvaluatedKey: LastEvaluatedKey || null,
        }
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

    getAllDisabledByChainId = async (chainId: number) => {
        const { Items, Count } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression:
                '#pkey = :pkey AND begins_with(#skey, :skeyBegin)',
            FilterExpression: '#blockNumberEnabled = :blockNumberEnabled',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
                '#blockNumberEnabled': 'blockNumberEnabled',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skeyBegin': `${chainId}#`,
                ':blockNumberEnabled': 0,
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
