// On-chain APR calculation is possible when
// - Staking tokens and reward tokens are exchangeable to the same currency (like USDC, or the staking token itself)

import { Handler } from 'aws-lambda'
import { cloneDeep } from 'lodash'
import { Address, createPublicClient, http } from 'viem'
import { getChainById } from '../../shared/supportedChains'
import abi from '../../src/abi/stakex/abi-ui.json'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'
import { calculationsFinish } from './trigger-calculations-finish'

type CalculateStakesSingleEventType = {
    fromBlock: number
    toBlock?: number
    chainId: number
    protocol: Address
}
type CalculateStakesBatchEventType = {
    batch: CalculateStakesSingleEventType[]
}

const events = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'staker',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'fromTokenId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'fee',
                type: 'uint256',
            },
            {
                components: [
                    {
                        components: [
                            {
                                internalType: 'string',
                                name: 'name',
                                type: 'string',
                            },
                            {
                                internalType: 'string',
                                name: 'symbol',
                                type: 'string',
                            },
                            {
                                internalType: 'uint8',
                                name: 'decimals',
                                type: 'uint8',
                            },
                            {
                                internalType: 'address',
                                name: 'source',
                                type: 'address',
                            },
                        ],
                        internalType: 'struct TokenInfo',
                        name: 'tokenInfo',
                        type: 'tuple',
                    },
                    {
                        internalType: 'uint256',
                        name: 'amount',
                        type: 'uint256',
                    },
                ],
                indexed: false,
                internalType: 'struct RewardEstimation',
                name: 'reward',
                type: 'tuple',
            },
            {
                components: [
                    {
                        components: [
                            {
                                internalType: 'string',
                                name: 'name',
                                type: 'string',
                            },
                            {
                                internalType: 'string',
                                name: 'symbol',
                                type: 'string',
                            },
                            {
                                internalType: 'uint8',
                                name: 'decimals',
                                type: 'uint8',
                            },
                            {
                                internalType: 'address',
                                name: 'source',
                                type: 'address',
                            },
                        ],
                        internalType: 'struct TokenInfo',
                        name: 'tokenInfo',
                        type: 'tuple',
                    },
                    {
                        internalType: 'uint256',
                        name: 'amount',
                        type: 'uint256',
                    },
                ],
                indexed: false,
                internalType: 'struct RewardEstimation[]',
                name: 'rewardBreakDown',
                type: 'tuple[]',
            },
        ],
        name: 'Restaked',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'staker',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'fee',
                type: 'uint256',
            },
        ],
        name: 'Staked',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'staker',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'targetToken',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'rewardAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'unstakeAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'fee',
                type: 'uint256',
            },
        ],
        name: 'Unstaked',
        type: 'event',
    },
]

const GATHER_LIMIT = 25

// - Staking token is the only reward token
export const handler: Handler<
    CalculateStakesSingleEventType | CalculateStakesBatchEventType
> = async (event, _, cb) => {
    let batch: CalculateStakesSingleEventType[] = []

    if ((event as CalculateStakesBatchEventType).batch) {
        batch.push(...(event as CalculateStakesBatchEventType).batch)
    } else {
        batch.push(event as CalculateStakesSingleEventType)
    }

    for (const item of batch) {
        const { chainId, protocol: address, fromBlock } = item
        const result = await calculateStakes(chainId, address, fromBlock)
        if (result.status === 'error') {
            console.log('BATCH ERROR', result.data)
            return cb(result.data)
        }
    }
    return cb(null, true)
}

const calculateStakes = async (
    chainId: number,
    address: Address,
    fromBlock: number
): Promise<{ status: 'success' | 'error'; data: any }> => {
    if (!chainId) return { status: 'error', data: 'MISSING_CHAIN_ID' }
    if (!fromBlock) return { status: 'error', data: 'MISSING_FROM_BLOCK' }
    if (!address) return { status: 'error', data: 'MISSING_PROTOCOL_ADDRESS' }

    const chain = getChainById(Number(chainId))
    if (!chain) return { status: 'error', data: 'UNSUPPORTED_CHAIN' }

    const TableName = process.env.DB_TABLE_NAME_STAKEX_LOGS!
    if (!TableName) return { status: 'error', data: 'TABLE_NAME_NOT_SET' }

    const PARTITION_VERSION = 'v_1'

    const client = createPublicClient({
        chain,
        transport: http(),
    })

    const db = new DynamoDBHelper({ region: 'eu-west-1' })
    const result = await db.query({
        TableName,
        IndexName: 'ProtocolIndex',
        KeyConditionExpression: 'protocol = :protocol',
        ExpressionAttributeValues: {
            ':protocol': address,
        },
        ScanIndexForward: false,
        Limit: 1,
    })

    let error: Error | null = null

    const getLogsData: any = {
        address,
        events,
        fromBlock: BigInt(fromBlock) + 1n, // last processed block + 1
    }

    if (result.Count && result.Items)
        getLogsData['fromBlock'] = BigInt(result.Items[0].blockNumber) + 1n // last processed block + 1

    const logs = await client.getLogs(getLogsData)

    type BatchWriteDataType = {
        pkey: string
        skey: string
        protocol: string
        timestamp: bigint
        blockNumber: bigint
        staked: bigint
    }

    const batchWriteData = async (data: BatchWriteDataType[]) =>
        await db.batchWrite({
            RequestItems: {
                [TableName]: data.map((Item) => ({
                    PutRequest: {
                        Item,
                    },
                })),
            },
        })

    let data: BatchWriteDataType[] = []
    let latestBlockNumber = 0n

    try {
        let limit = 1
        for (const log of logs) {
            const { blockNumber } = log as any
            const { timestamp } = await client.getBlock({ blockNumber })
            const stakingData: any = await client.readContract({
                address,
                abi,
                functionName: 'getStakingData',
                blockNumber,
            })

            const _data: BatchWriteDataType = {
                pkey: PARTITION_VERSION,
                skey: `${address}#${blockNumber}`,
                protocol: address,
                blockNumber,
                timestamp,
                staked: stakingData.staked.amount,
            }

            data.push(_data)

            if (GATHER_LIMIT === limit) {
                await batchWriteData(cloneDeep(data))
                data = []
                limit = 1
            } else limit++

            latestBlockNumber = BigInt(blockNumber)
        }
        // data
    } catch (e) {
        error = e as Error
    }

    if (data.length > 0) await batchWriteData(data)

    if (error) return { status: 'error', data: error.message }

    return await calculationsFinish(
        chainId,
        address,
        null,
        Number(latestBlockNumber)
    )
}
