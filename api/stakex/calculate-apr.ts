import { Handler } from 'aws-lambda'
import { Address, createPublicClient, http } from 'viem'
import { getChainById } from '../../shared/supportedChains'
import abi from '../../src/abi/stakex/abi-ui.json'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'
import { calculationsFinish } from './trigger-calculations-finish'
// TODO maybe rename it in log APR

type CalculateAprSingleEventType = {
    fromBlock: number
    toBlock?: number
    chainId: number
    protocol: Address
}
type CalculateAprBatchEventType = {
    batch: CalculateAprSingleEventType[]
}

const abiEvents = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'depositer',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'rewardToken',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'Deposited',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'manager',
                type: 'address',
            },
        ],
        name: 'Enabled',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'manager',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'chosenTime',
                type: 'uint256',
            },
        ],
        name: 'UpdatedActiveTime',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'manager',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'chosenBlock',
                type: 'uint256',
            },
        ],
        name: 'UpdatedActiveBlock',
        type: 'event',
    },
]

const gmxReaderAbi = [
    {
        inputs: [
            {
                internalType: 'contract IVault',
                name: '_vault',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_tokenIn',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_tokenOut',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '_amountIn',
                type: 'uint256',
            },
        ],
        name: 'getAmountOut',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
]

const gmxRouterAbi = [
    {
        inputs: [],
        name: 'vault',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
]

const dexRouterAbi = [
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256',
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]',
            },
        ],
        name: 'getAmountsOut',
        outputs: [
            {
                internalType: 'uint256[]',
                name: 'amounts',
                type: 'uint256[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
]

// On-chain APR calculation is possible when
// - Staking tokens and reward tokens are exchangeable to the same currency (like USDC, or the staking token itself)
// - Staking token is the only reward token
export const handler: Handler<
    CalculateAprSingleEventType | CalculateAprBatchEventType
> = async (event, _, cb) => {
    let batch: CalculateAprSingleEventType[] = []

    if ((event as CalculateAprBatchEventType).batch) {
        batch.push(...(event as CalculateAprBatchEventType).batch)
    } else {
        batch.push(event as CalculateAprSingleEventType)
    }

    for (const item of batch) {
        const { chainId, protocol: address, fromBlock, toBlock } = item
        const result = await calculateAPR(chainId, address, fromBlock, toBlock)
        if (result.status === 'error') {
            console.log('BATCH ERROR', result.data)
            return cb(result.data)
        }
    }
    return cb(null, true)
}

const calculateAPR = async (
    chainId: number,
    address: Address,
    fromBlock: number,
    toBlock?: number
): Promise<{ status: 'success' | 'error'; data: any }> => {
    if (!chainId) return { status: 'error', data: 'MISSING_CHAIN_ID' }
    if (!fromBlock) return { status: 'error', data: 'MISSING_FROM_BLOCK' }
    if (!address) return { status: 'error', data: 'MISSING_PROTOCOL_ADDRESS' }

    const chain = getChainById(Number(chainId))
    const PARTITION_VERSION = 'v_1'

    if (!chain) return { status: 'error', data: 'UNSUPPORTED_CHAIN' }

    const client = createPublicClient({
        chain,
        transport: http(),
    })

    let isRunningContract = false
    try {
        isRunningContract = (await client.readContract({
            abi,
            address,
            functionName: 'isRunning',
        })) as boolean
        if (!isRunningContract) return { status: 'error', data: 'NOT_RUNNING' }
    } catch (e) {
        return { status: 'error', data: (e as Error).message }
    }

    const startBlock = await client.getBlock({ blockNumber: BigInt(fromBlock) })
    const endBlock = toBlock
        ? await client.getBlock({ blockNumber: BigInt(toBlock!) })
        : await client.getBlock()

    // get deposited events
    const depositLogs = await client.getContractEvents({
        address,
        abi: abiEvents,
        fromBlock: startBlock.number,
        toBlock: endBlock.number,
        eventName: 'Deposited',
    })

    // check whether it's a staking token stand alone
    const stakingToken = (await client.readContract({
        abi,
        address,
        functionName: 'getStakingToken',
    })) as any

    if (!stakingToken.isReward) {
        // TODO Staking token is the only reward token
        // maybe we can use the same algo that goes for non-only reward token for both
        return {
            status: 'error',
            data: 'NO_GMX_SUPPORT_YET',
        }
    } else {
        const swaps = (await client.readContract({
            abi,
            address,
            functionName: 'getSwaps',
        })) as any[]

        const swapsFromTo = swaps.reduce(
            (acc, swap) => ({
                ...acc,
                [swap.from]: {
                    ...(acc[swap.from] ? acc[swap.from] : {}),
                    [swap.to]: swap.swaps,
                },
            }),
            {}
        )

        const getSwapAmount = async (
            fromAmount: bigint,
            swaps: any[],
            blockNumber: bigint
        ) => {
            let toAmount = fromAmount
            for (const swap of swaps) {
                if (swap.isGMX) {
                    const toAmounts = (await client.readContract({
                        abi: gmxReaderAbi,
                        address: swap.calleeAmountOut,
                        args: [
                            (await client.readContract({
                                abi: gmxRouterAbi,
                                address: swap.calleeSwap,
                                functionName: 'vault',
                                blockNumber,
                                account: address,
                            })) as Address,
                            swap.path[0],
                            swap.path[swap.path.length - 1],
                            toAmount,
                        ],
                        functionName: 'getAmountOut',
                        blockNumber,
                        account: address,
                    })) as bigint[]

                    toAmount = toAmounts[0]
                    // console.log('THROUGH GMX', { toAmount })
                } else {
                    const toAmounts = (await client.readContract({
                        abi: dexRouterAbi,
                        address: swap.calleeAmountOut,
                        args: [toAmount, swap.path],
                        functionName: 'getAmountsOut',
                        blockNumber,
                        account: address,
                    })) as bigint[]
                    toAmount = toAmounts[toAmounts.length - 1]
                    // console.log('THROUGH DEX', { toAmount })
                }
            }
            return toAmount
        }

        let cumulativePayouts = 0n

        for (const log of depositLogs) {
            const { rewardToken, amount } = (log as any).args

            // when the reward token isn't the staking token
            cumulativePayouts +=
                stakingToken.source !== rewardToken
                    ? await getSwapAmount(
                          amount,
                          swapsFromTo[stakingToken.source][rewardToken],
                          log.blockNumber
                      )
                    : amount
        }

        const yearlyPayout = BigInt(
            (Number(cumulativePayouts) /
                (Number(endBlock.timestamp - startBlock.timestamp) / 86400)) *
                365
        )

        const stakeBuckets = (await client.readContract({
            abi,
            address,
            functionName: 'getStakeBuckets',
        })) as any[]

        const perBucketAprApy = stakeBuckets.map((bucket: any) => {
            const apr =
                Number(
                    (yearlyPayout * BigInt(bucket.share)) /
                        10000n /
                        10n ** BigInt(stakingToken.decimals)
                ) / Number(bucket.staked / 10n ** BigInt(stakingToken.decimals))
            return {
                bucketId: bucket.id,
                apr: !isNaN(apr) ? apr * 100 : 0,
                apy: !isNaN(apr) ? ((1 + apr / 52) ** 52 - 1) * 100 : 0,
            }
        })

        const db = new DynamoDBHelper({ region: 'eu-west-1' })
        const { timestamp, number: blockNumber } = endBlock

        for (const item of perBucketAprApy) {
            const { bucketId, apr, apy } = item
            const storeData = {
                pkey: PARTITION_VERSION,
                skey: `${address}#${bucketId}#${Number(blockNumber)}`,
                protocol: address,
                bucketId,
                blockNumber: Number(blockNumber),
                timestamp: Number(timestamp),
                fromBlock,
                toBlock,
                apr,
                apy,
            }
            await db.batchWrite({
                RequestItems: {
                    [process.env.DB_TABLE_NAME_STAKEX_ANNUAL_PERCENTAGE_LOGS!]:
                        [
                            {
                                PutRequest: {
                                    Item: storeData,
                                },
                            },
                        ],
                },
            })
        }

        return await calculationsFinish(
            chainId,
            address,
            Number(blockNumber),
            null
        )
    }
}
