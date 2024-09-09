import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { first } from 'lodash'
import { createPublicClient, http } from 'viem'
import { getChainById } from '../../shared/supportedChains'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'
import { createReturn } from '../helpers/return'
import abi from './../../src/abi/stakex/abi-ui.json'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { chainId, protocol } = event.pathParameters as any

    const db = new DynamoDBHelper({ region: 'eu-west-1' })
    const PARTITION_VERSION = 'v_1'

    // last update data
    const protocols = await db.query({
        TableName: process.env.DB_TABLE_NAME_STAKEX_PROTOCOLS,
        KeyConditionExpression: '#pkey = :pkey AND #skey = :skey',
        ExpressionAttributeNames: {
            '#pkey': 'pkey',
            '#skey': 'skey',
        },
        ExpressionAttributeValues: {
            ':pkey': PARTITION_VERSION,
            ':skey': `${chainId}#${protocol}`,
        },
        Limit: 1,
    })

    if (!protocols.Count || !protocols.Items?.length)
        return createReturn(404, JSON.stringify({}))

    const {
        blockNumberAPUpdate,
        blockNumberStakesUpdate,
        blockNumberAPUpdateIntervall,
    } = protocols.Items[0]

    const protocolInformation = {
        // protcol information
        blockNumberAPUpdate,
        blockNumberStakesUpdate,
        blockNumberAPUpdateIntervall,
    }

    // latest APR/APY per bucket
    const chain = getChainById(Number(chainId))

    if (!chain) return createReturn(403, JSON.stringify({}))

    const client = createPublicClient({
        chain,
        transport: http(),
    })

    const buckets = (await client.readContract({
        address: protocol,
        abi,
        functionName: 'getStakeBuckets',
    })) as any[]

    const { decimals } = (await client.readContract({
        address: protocol,
        abi,
        functionName: 'getStakingToken',
    })) as any

    let annualPercentageData = {}
    for (const bucket of buckets) {
        const { Count, Items } = await db.query({
            TableName: process.env.DB_TABLE_NAME_STAKEX_ANNUAL_PERCENTAGE_LOGS,
            KeyConditionExpression:
                '#pkey = :pkey AND begins_with(#skey, :skey)',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
                '#skey': 'skey',
            },
            ExpressionAttributeValues: {
                ':pkey': PARTITION_VERSION,
                ':skey': `${protocol}#${bucket.id}#`,
            },
            ScanIndexForward: false,
            Limit: 1,
        })

        if (!Count) continue

        const { bucketId, apr, apy, fromBlock, toBlock } = Items?.[0] as any

        annualPercentageData = {
            ...annualPercentageData,
            [bucketId]: { bucketId, apr, apy, fromBlock, toBlock },
        }
    }

    const stakexLogs = await db.query({
        TableName: process.env.DB_TABLE_NAME_STAKEX_LOGS,
        KeyConditionExpression: '#pkey = :pkey AND begins_with(#skey, :skey)',
        ExpressionAttributeNames: {
            '#pkey': 'pkey',
            '#skey': 'skey',
        },
        ExpressionAttributeValues: {
            ':pkey': PARTITION_VERSION,
            ':skey': `${protocol}#`,
        },
        ScanIndexForward: true,
    })

    let stakeLogs: any[] = []

    if (stakexLogs.Count && stakexLogs.Items?.length) {
        // initialElement
        const firstItem = first(stakexLogs.Items)!

        stakeLogs.push({
            timestamp:
                firstItem.timestamp - (firstItem.timestamp % 86400) - 86400,
            staked: 0,
        })

        stakeLogs.push(
            ...stakexLogs.Items.map((item) => ({
                timestamp: item.timestamp,
                staked: Number(item.staked) / 10 ** Number(decimals),
            }))
        )
    }

    return createReturn(
        200,
        JSON.stringify({ annualPercentageData, protocolInformation, stakeLogs })
    )
}
