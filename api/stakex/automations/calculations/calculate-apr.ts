import { Handler } from 'aws-lambda'
import { chunk, isUndefined, toLower } from 'lodash'
import { Address, Chain, createPublicClient, http, parseEventLogs } from 'viem'
import { chains } from '../../../../shared/supportedChains'
import abi from '../../../../src/abi/stakex/abi-ui.json'
import { StakeBucket, TokenInfoResponse } from '../../../../src/types'
import { getTokensForOneToken } from '../../../helpers/tokens'
import {
    StakeXAnnualsCreateDTO,
    StakeXAnnualsRepository,
} from '../../../services/annuals'
import { StakeXProtocolLogsRepository } from '../../../services/protocolLogs'
import { StakeXProtocolsRepository } from '../../../services/protocols'

export const handler: Handler = async (_, __, callback) => {
    for (const chain of chains) await calculateAPRForChain(chain)
    return callback()
}

export const calculateAPRForChain = async (chain: Chain) => {
    const annualsRepo = new StakeXAnnualsRepository()
    const protocolsRepo = new StakeXProtocolsRepository()
    const protocolLogsRepo = new StakeXProtocolLogsRepository()

    const client = createPublicClient({
        chain,
        transport: http(undefined, {
            fetchOptions: {
                headers: {
                    Origin: 'https://dgnx.finance',
                },
            },
        }),
    })

    const currentBlock = await client.getBlock()

    // get protocols from chain
    const protocols = await protocolsRepo.getAllRegularsByChainId(chain.id)

    const events = [
        'Staked',
        'Unstaked',
        'Restaked',
        'AddedUp',
        'Merged',
        'Upstaked',
        'Deposited',
    ]

    // walk through every protocol and check for new logs
    for (const protocol of protocols.items) {
        const batch: StakeXAnnualsCreateDTO[] = []

        const blockNumberAPUpdate = Number(currentBlock.number)

        if (
            !isUndefined(protocol.blockNumberAPUpdate) &&
            blockNumberAPUpdate <= protocol.blockNumberAPUpdate
        )
            continue

        const blockNumberStart =
            blockNumberAPUpdate - protocol.blockNumberAPPeriod! < 1n
                ? 1
                : blockNumberAPUpdate - protocol.blockNumberAPPeriod!

        const logsRaw = await protocolLogsRepo.getForProtocolSinceBlockNumber(
            protocol.chainId,
            protocol.protocol,
            blockNumberStart
        )

        const startBlock = await client.getBlock({
            blockNumber: BigInt(blockNumberStart),
        })

        const logs = parseEventLogs({
            abi: abi.filter(
                (fragment) =>
                    fragment.type == 'event' && events.includes(fragment.name)
            ),
            logs: logsRaw.items
                .sort((a, b) => (a.blockNumber > b.blockNumber ? 1 : -1))
                .map((log) => ({ ...log.log })),
        })

        const actionBlocks = logs
            .reduce((acc: number[], log) => {
                if (!acc.includes(Number(log.blockNumber)))
                    acc.push(Number(log.blockNumber))
                return acc
            }, [])
            .sort((a, b) => (a > b ? 1 : -1))

        let aggregatedSharesForBucket: { [bucketId: string]: number } = {}
        const injectedPerTokenAllBlocks: { [tokenAddress: Address]: bigint } =
            {}

        if (actionBlocks.length > 1) {
            let injectionCount = 0
            for (const actionBlock of actionBlocks) {
                // needs infos for each block
                const callData = await client.multicall({
                    contracts: [
                        {
                            abi,
                            address: protocol.protocol as Address,
                            functionName: 'getStakingToken',
                        },
                        {
                            abi,
                            address: protocol.protocol as Address,
                            functionName: 'getStakeBuckets',
                        },
                        {
                            abi,
                            address: protocol.protocol as Address,
                            functionName: 'getTokens',
                        },
                    ],
                    blockNumber: BigInt(actionBlock),
                })

                const [stakingTokenCall, stakeBucketsCall, tokensCall] =
                    callData

                // Staking Token
                const stakingToken =
                    stakingTokenCall.status == 'success'
                        ? (stakingTokenCall.result as TokenInfoResponse)
                        : null
                const stakeBuckets =
                    stakeBucketsCall.status == 'success'
                        ? (stakeBucketsCall.result as StakeBucket[])
                        : null
                const tokens =
                    tokensCall.status == 'success'
                        ? (tokensCall.result as TokenInfoResponse[])
                        : null

                if (!stakingToken || !stakeBuckets || !tokens) continue

                ///
                /// APR per token per block
                ///

                let injectedCurrentBlock = 0n
                // if staking tokens is reward token, calculate APR through staking token
                if (stakingToken.isReward || stakingToken.isTarget) {
                    // swap calls to use for multi call in case there are multiple tokens
                    const swapCalls: any[] = []

                    // gather information for each token
                    for (const token of tokens) {
                        if (!injectedPerTokenAllBlocks[token.source])
                            injectedPerTokenAllBlocks[token.source] = 0n

                        const recentlyInjected =
                            token.injected -
                            injectedPerTokenAllBlocks[token.source]

                        injectedPerTokenAllBlocks[token.source] = token.injected

                        // when the current token differs from staking token
                        if (token.source != stakingToken.source) {
                            // convert to staking token per block through swap
                            if (recentlyInjected > 0n) {
                                swapCalls.push({
                                    abi,
                                    address: protocol.protocol,
                                    args: [
                                        token.source,
                                        stakingToken.source,
                                        recentlyInjected,
                                    ],
                                    functionName: 'getSwapAmountOut',
                                    account: protocol.protocol,
                                })
                            }
                        } else injectedCurrentBlock += recentlyInjected
                    }

                    if (swapCalls.length) {
                        const callReponses = await client.multicall({
                            contracts: swapCalls,
                            blockNumber: BigInt(actionBlock),
                        })

                        for (const callResponse of callReponses)
                            if (callResponse.status == 'success')
                                injectedCurrentBlock +=
                                    callResponse.result as bigint
                    }
                } else {
                    // gather information for each token
                    for (const token of tokens) {
                        const tokenForOneStakingToken =
                            await getTokensForOneToken(
                                protocol.chainId,
                                token.source,
                                stakingToken.source
                            )

                        if (tokenForOneStakingToken > 0n) {
                            if (!injectedPerTokenAllBlocks[token.source])
                                injectedPerTokenAllBlocks[token.source] = 0n

                            const convertedInjected =
                                (token.injected *
                                    10n ** BigInt(stakingToken.decimals)) /
                                tokenForOneStakingToken

                            const recentlyInjected =
                                convertedInjected -
                                injectedPerTokenAllBlocks[token.source]

                            injectedPerTokenAllBlocks[token.source] =
                                convertedInjected

                            injectedCurrentBlock += recentlyInjected
                        }
                    }
                }

                // when there is an injection, calculate the desired share. zero have to be ignored in order to not calculate a wrong avg
                if (injectedCurrentBlock > 0n) {
                    injectionCount++
                    aggregatedSharesForBucket = stakeBuckets.reduce(
                        (acc: any, bucket: StakeBucket) => ({
                            ...acc,
                            [bucket.id]:
                                (aggregatedSharesForBucket[bucket.id] || 0) +
                                (Number(injectedCurrentBlock) *
                                    Number(bucket.share)) /
                                    10000 /
                                    10 ** Number(stakingToken.decimals) /
                                    (Number(bucket.staked) /
                                        10 ** Number(stakingToken.decimals)),
                        }),
                        {}
                    )
                }
            }

            for (const bucketId in aggregatedSharesForBucket) {
                let apr =
                    (aggregatedSharesForBucket[bucketId] /
                        injectionCount /
                        ((Number(currentBlock.timestamp) -
                            Number(startBlock.timestamp)) /
                            86400)) *
                    365
                if (apr > Number.MAX_SAFE_INTEGER) apr = -1

                let apy = (1 + apr / 52) ** 52 - 1
                if (apy > Number.MAX_SAFE_INTEGER) apy = -1

                batch.push({
                    chainId: Number(protocol.chainId),
                    protocol: toLower(protocol.protocol),
                    bucketId,
                    timestamp: Number(currentBlock.timestamp),
                    fromBlock: Number(startBlock.number),
                    toBlock: Number(currentBlock.number),
                    apr: apr * 100,
                    apy: apy > 0 ? apy * 100 : apy,
                })
            }
        } else {
            // get current buckets
            const stakeBuckets = (await client.readContract({
                abi,
                address: protocol.protocol as Address,
                functionName: 'getStakeBuckets',
                blockNumber: currentBlock.number,
            })) as StakeBucket[]

            for (const stakeBucket of stakeBuckets) {
                batch.push({
                    chainId: Number(protocol.chainId),
                    protocol: toLower(protocol.protocol),
                    bucketId: stakeBucket.id,
                    timestamp: Number(currentBlock.timestamp),
                    fromBlock: Number(startBlock.number),
                    toBlock: Number(currentBlock.number),
                    apr: 0,
                    apy: 0,
                })
            }
        }

        console.log(batch)
        // if there are updates, put it into db
        if (batch.length > 0) {
            const batchChunks = chunk(batch, 25)
            for (const batchChunk of batchChunks) {
                if (batchChunk.length > 0) {
                    await annualsRepo.createBatch(batchChunk)
                }
            }
        }

        if (
            !isUndefined(protocol.blockNumberAPUpdate) &&
            protocol.blockNumberAPUpdate < blockNumberAPUpdate
        ) {
            await protocolsRepo.update({
                protocol: protocol.protocol,
                chainId: protocol.chainId,
                blockNumberAPUpdate,
            })
        }
    }
}
