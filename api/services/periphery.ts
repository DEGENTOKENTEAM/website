import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import {
    BatchWriteCommandInput,
    UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'
import { Address } from 'viem'
import { toLower } from 'lodash'

export type StakeXPeripheryDTO = {
    chainId: number
    protocol: string
    manifestCID: string
    manifestCIDNext: string | null
}

export type StakeXPeripheryUpdateDTO = {
    chainId: number
    protocol: string
} & Partial<StakeXPeripheryDTO>

export type StakeXPeripheryResponse = {
    pkey: string
    skey: string
} & StakeXPeripheryDTO

type RepositoryContructorOptions = {
    dynamoDBConfig: DynamoDBClientConfig
} & any

const pkey = 'v_1'
const region = 'eu-west-1'
const TableName = process.env.DB_TABLE_NAME_STAKEX_CUSTOMIZATION_V2!

export class StakeXPeripheryRepository {
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

    createBatch = async (data: StakeXPeripheryDTO[]) => {
        const items = data.map((item) => ({
            pkey,
            skey: `${item.chainId}#${toLower(item.protocol)}`,
            ...item,
        })) as StakeXPeripheryResponse[]
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

    read = async (chainId: number, protocol: Address) => {
        const { Items, Count } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression: '#pkey = :pkey AND #skey = :skey',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skey': `${chainId}#${toLower(protocol)}`,
            },
        })
        return Count && Items ? (Items[0] as StakeXPeripheryResponse) : null
    }

    readAllUpdated = async () => {
        const { Items, Count } = await this._db.query({
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression: '#pkey = :pkey',
            FilterExpression: '#manifestCIDNext <> :manifestCIDNext',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#manifestCIDNext': 'manifestCIDNext',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':manifestCIDNext': '',
            },
        })
        return Count && Items ? (Items as StakeXPeripheryResponse[]) : []
    }
}
