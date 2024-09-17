import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'

type CoingeckoApiCacheCreateDTO = {
    requestPath: string
    responseData: any
}

type CoingeckoApiCacheCreateResponse = {
    pkey: string
    skey: string
    ttl: number
} & CoingeckoApiCacheCreateDTO

type RepositoryContructorOptions = {
    dynamoDBConfig: DynamoDBClientConfig
} & any

const pkey = 'v_1'
const region = 'eu-west-1'
const ttl = parseInt(process.env.DB_TABLE_NAME_COINGECKO_API_CACHE_TTL!)
const TableName = process.env.DB_TABLE_NAME_COINGECKO_API_CACHE!

export class CoingeckoApiCacheRepository {
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

    create = async (
        data: CoingeckoApiCacheCreateDTO
    ): Promise<CoingeckoApiCacheCreateResponse> => {
        const itemKeys = Object.keys(data)
        const itemData: CoingeckoApiCacheCreateResponse = {
            pkey,
            skey: `${data.requestPath}`,
            ...itemKeys.reduce(
                (accumulator, k) => ({
                    ...accumulator,
                    [k]: (data as any)[k],
                }),
                {}
            ),
            requestPath: data.requestPath,
            responseData: data.responseData,
            ttl,
        }
        await this._db.create({
            TableName: this.options.dynamoDBConfig.params.TableName,
            Item: itemData,
        })
        return itemData
    }

    get = async (path: string) => {
        const { Items, Count } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression: '#pkey = :pkey AND #skey = :skey',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skey': `${path}`,
            },
            Limit: 1,
        })
        return Boolean(Count) ? Items?.[0].responseData : null
    }
}
