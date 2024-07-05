import { InvokeAsyncCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { Handler } from 'aws-lambda'
import { createPublicClient, http } from 'viem'
import { chains } from '../../../shared/supportedChains'
import { DynamoDBHelper } from '../../helpers/ddb/dynamodb'

export const handler: Handler = async (event, context, callback) => {
    const { LAMBDA_APR_NAME, LAMBDA_STAKES_NAME } = process.env
    const PARTITION_VERSION = 'v_1'
    const db = new DynamoDBHelper({ region: 'eu-west-1' })
    const lambdaClient = new LambdaClient()

    for (const chain of chains) {
        const publicClient = createPublicClient({
            chain,
            transport: http(),
        })

        const protocols = await db.query({
            TableName: process.env.DB_TABLE_NAME_STAKEX_PROTOCOLS,
            KeyConditionExpression:
                '#pkey = :version AND begins_with(#skey, :skey)',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
            },
            ExpressionAttributeValues: {
                ':version': PARTITION_VERSION,
                ':skey': `${chain.id}#`,
            },
        })

        if (protocols && protocols.Count) {
            const { Items: items } = protocols
            const toBlock = Number((await publicClient.getBlock()).number)
            for (const item of items!) {
                const {
                    chainId,
                    blockNumberAPUpdate,
                    blockNumberAPUpdateIntervall,
                    blockNumberStakesUpdate,
                    protocol,
                    blockNumberEnabled,
                } = item

                const promises: Promise<any>[] = []
                if (blockNumberEnabled > 0) {
                    const fromBlockAP = !blockNumberAPUpdate
                        ? blockNumberEnabled
                        : blockNumberAPUpdate

                    if (toBlock - fromBlockAP > blockNumberAPUpdateIntervall) {
                        promises.push(
                            lambdaClient.send(
                                new InvokeAsyncCommand({
                                    FunctionName: LAMBDA_APR_NAME,
                                    InvokeArgs: JSON.stringify({
                                        chainId: Number(chainId),
                                        protocol,
                                        fromBlock: fromBlockAP,
                                        toBlock,
                                    }),
                                })
                            )
                        )
                    }

                    promises.push(
                        lambdaClient.send(
                            new InvokeAsyncCommand({
                                FunctionName: LAMBDA_STAKES_NAME,
                                InvokeArgs: JSON.stringify({
                                    chainId: Number(chainId),
                                    protocol,
                                    fromBlock: blockNumberEnabled, // always start from enabled block
                                }),
                            })
                        )
                    )
                }

                Promise.all(promises)
                    .then((invokeResults) => {
                        callback(null, { invokeResults })
                    })
                    .catch((reason) => {
                        callback(reason, false)
                    })
            }
        }
    }
}
