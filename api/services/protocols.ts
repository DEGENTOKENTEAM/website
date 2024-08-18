import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { UpdateCommandInput } from '@aws-sdk/lib-dynamodb'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'

type StakeXProtocolsCreateDTO = {
    chainId: number
    protocol: string
    timestamp: number
    blockNumberCreated: number
    blockNumberEnabled: number
    blockNumberAPUpdate: number
    blockNumberStakesUpdate: number
    blockNumberAPUpdateIntervall: number
}
type StakeXProtocolsUpdateDTO = {
    timestamp: number
    blockNumberCreated: number
    blockNumberEnabled: number
    blockNumberAPUpdate: number
    blockNumberStakesUpdate: number
    blockNumberAPUpdateIntervall: number
}
type StakeXProtocolsCreateResponse = {
    pkey: string
    skey: string
} & StakeXProtocolsCreateDTO
type StakeXProtocolsUpdateResponse = {
    pkey: string
    skey: string
    chainId: number
    protocol: string
} & StakeXProtocolsUpdateDTO

type RepositoryContructorOptions = {
    dynamoDBConfig: DynamoDBClientConfig
} & any

const pkey = 'v_1'
const region = 'eu-west-1' // TODO update this little shit here
const TableName = process.env.DB_TABLE_NAME_STAKEX_PROTOCOLS!

export class StakeXProtocolsRepository {
    options: RepositoryContructorOptions
    _db: DynamoDBHelper

    constructor(_options: RepositoryContructorOptions) {
        this.options = {
            dynamoDBConfig: {
                params: { TableName },
                region,
            },
            ..._options,
        }
        this._db = new DynamoDBHelper(this.options.dynamoDBConfig)
    }

    // create = async (data: StakeXProtocolsCreateDTO) => {
    //     const itemKeys = Object.keys(data)
    //     const itemData = {
    //         pkey,
    //         skey: `${data.chainId}#${data.protocol}`,
    //         ...itemKeys.reduce(
    //             (accumulator, k) => ({
    //                 ...accumulator,
    //                 [k]: (data as any)[k],
    //             }),
    //             {}
    //         ),
    //     } as StakeXProtocolsCreateResponse
    //     await this._db.create({
    //         TableName: this.options.dynamoDBConfig.params.TableName,
    //         Item: itemData,
    //     })
    //     return itemData
    // }

    // update = async (
    //     chainId: number,
    //     protocol: string,
    //     data: StakeXProtocolsUpdateDTO
    // ) => {
    //     const itemKeys = Object.keys(data)
    //     const params: UpdateCommandInput = {
    //         TableName: this.options.dynamoDBConfig.params.TableName,
    //         Key: {
    //             pkey,
    //             skey: `${chainId}#${protocol}`,
    //         },
    //         UpdateExpression: `SET ${itemKeys
    //             .map((_, index) => `#field${index} = :value${index}`)
    //             .join(', ')}`,
    //         ExpressionAttributeNames: itemKeys.reduce(
    //             (accumulator, k, index) => ({
    //                 ...accumulator,
    //                 [`#field${index}`]: k,
    //             }),
    //             {}
    //         ),
    //         ExpressionAttributeValues: itemKeys.reduce(
    //             (accumulator, k, index) => ({
    //                 ...accumulator,
    //                 [`:value${index}`]: (data as any)[k],
    //             }),
    //             {}
    //         ),
    //     }
    //     await this._db.update(params)
    //     return { chainId, protocol, ...data } as StakeXProtocolsUpdateResponse
    // }

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
                '#skey': 'sakey',
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
            items: Items || [],
            count: Count || 0,
            lastEvaluatedKey: LastEvaluatedKey || null,
        }
    }
}
