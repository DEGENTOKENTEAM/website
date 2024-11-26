import {
    DynamoDBClient,
    DynamoDBClientConfig,
    PutItemCommand,
    PutItemCommandInput,
} from '@aws-sdk/client-dynamodb'
import {
    BatchWriteCommand,
    BatchWriteCommandInput,
    DeleteCommand,
    DeleteCommandInput,
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandInput,
    GetCommandOutput,
    PutCommand,
    PutCommandInput,
    QueryCommand,
    QueryCommandInput,
    ScanCommand,
    ScanCommandInput,
    UpdateCommand,
    UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'

export class DynamoDBHelper {
    _docClient: DynamoDBDocumentClient

    constructor(options: DynamoDBClientConfig & any) {
        if (process.env.IS_OFFLINE) {
            options = Object.assign(options || {}, {
                region: 'localhost',
                endpoint: 'http://localhost:8000',
            })
        }
        this._docClient = DynamoDBDocumentClient.from(
            new DynamoDBClient(options),
            { marshallOptions: { removeUndefinedValues: true } }
        )
    }

    create = async (params: PutCommandInput) => {
        const command = new PutCommand({ ...params })
        const response = await this._docClient.send(command)
        return response
    }

    read = async <T = any>(params: GetCommandInput) => {
        const command = new GetCommand({ ...params })
        const response = (await this._docClient.send(command)) as Omit<
            GetCommandOutput,
            'Item'
        > & { Item: T }
        return response
    }

    batchWrite = async (params: BatchWriteCommandInput) => {
        const command = new BatchWriteCommand({ ...params })
        const response = await this._docClient.send(command)
        return response
    }

    query = async (params: QueryCommandInput) => {
        const command = new QueryCommand({ ...params })
        const response = await this._docClient.send(command)
        return response
    }

    scan = async (params: ScanCommandInput) => {
        const command = new ScanCommand({ ...params })
        const response = await this._docClient.send(command)
        return response
    }

    update = async (params: UpdateCommandInput) => {
        const command = new UpdateCommand({ ...params })
        const response = await this._docClient.send(command)
        return response
    }

    delete = async (params: DeleteCommandInput) => {
        const command = new DeleteCommand({ ...params })
        const response = await this._docClient.send(command)
        return response
    }
}
