import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'

export type StakeXChainSyncDTO = {
    chainId: number
    blockNumber: number
    lastRunning: number
    lastSucceed: number
    running: boolean
    successful: boolean
    error: string
}
export type StakeXChainSyncDTOResponse = {
    pkey: string
    skey: number
} & StakeXChainSyncDTO

type RepositoryContructorOptions = {
    dynamoDBConfig: DynamoDBClientConfig
} & any

const pkey = 'v_1'
const region = 'eu-west-1' // TODO update this little shit here
const TableName = process.env.DB_TABLE_NAME_STAKEX_CHAIN_SYNC!

export class StakeXChainSyncRepository {
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

    bump = async (
        data: StakeXChainSyncDTO
    ): Promise<StakeXChainSyncDTOResponse> => {
        const skey = data.chainId
        const itemKeys = Object.keys(data)
        const itemData = {
            pkey,
            skey,
            ...itemKeys.reduce(
                (accumulator, k) => ({
                    ...accumulator,
                    [k]: (data as any)[k],
                }),
                {}
            ),
        } as StakeXChainSyncDTOResponse

        await this._db.batchWrite({
            RequestItems: {
                [this.options.dynamoDBConfig.params.TableName]: [
                    {
                        PutRequest: {
                            Item: itemData,
                        },
                    },
                ],
            },
        })

        return itemData
    }

    getByChainId = async (
        chainId: number
    ): Promise<StakeXChainSyncDTOResponse | null> => {
        const query = {
            TableName: this.options.dynamoDBConfig.params.TableName,
            KeyConditionExpression: '#pkey = :pkey AND #skey = :skey',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
                ':skey': chainId,
            },
            ConsistentRead: true,
            ScanIndexForward: false,
            Limit: 1,
        }
        const { Items, Count } = await this._db.query(query)
        return Count && Items ? (Items[0] as StakeXChainSyncDTOResponse) : null
    }
}
