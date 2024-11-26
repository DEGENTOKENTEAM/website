import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { first, toLower } from 'lodash'
import { createPublicClient, http } from 'viem'
import { getChainById } from '../../shared/supportedChains'
import { createReturn } from '../helpers/return'
import { StakeXAnnualsRepository } from '../services/annuals'
import { StakeXProtocolsRepository } from '../services/protocols'
import { StakeXStakeLogsRepository } from '../services/stakeLogs'
import abi from './../../src/abi/stakex/abi-ui.json'
import { StakeBucket, TokenInfoResponse } from '../../src/types'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { chainId, protocol } = event.pathParameters as any

    const stakeLogsRepository = new StakeXStakeLogsRepository()
    const annualsRepository = new StakeXAnnualsRepository()
    const protocolsRepository = new StakeXProtocolsRepository()

    const protocolData = await protocolsRepository.get(
        Number(chainId),
        toLower(protocol)
    )

    if (!protocolData) return createReturn(404, JSON.stringify({}))

    const { blockNumberAPUpdate, blockNumberStakesUpdate } = protocolData

    const protocolInformation = {
        // protocol information
        blockNumberAPUpdate,
        blockNumberStakesUpdate,
    }

    const client = createPublicClient({
        chain: getChainById(Number(chainId)),
        transport: http(),
    })

    const [bucketsCallData, stakingTokenCallData] = await client.multicall({
        contracts: [
            {
                abi,
                address: protocol,
                functionName: 'getStakeBuckets',
            },
            {
                abi,
                address: protocol,
                functionName: 'getStakingToken',
            },
        ],
    })

    const buckets =
        bucketsCallData.status == 'success'
            ? (bucketsCallData.result as StakeBucket[])
            : null
    const stakingToken =
        stakingTokenCallData.status == 'success'
            ? (stakingTokenCallData.result as TokenInfoResponse)
            : null

    if (!buckets || !stakingToken) return createReturn(404, JSON.stringify({}))

    let annualPercentageData = {}
    for (const bucket of buckets) {
        const annual = await annualsRepository.getMostRecentBucket(
            protocol,
            bucket.id
        )

        if (!annual) {
            annualPercentageData = {
                ...annualPercentageData,
                [bucket.id]: {
                    bucketId: bucket.id,
                    apr: 0,
                    apy: 0,
                    fromBlock: 0,
                    toBlock: 0,
                },
            }
        } else {
            const { bucketId, apr, apy, fromBlock, toBlock } = annual
            annualPercentageData = {
                ...annualPercentageData,
                [bucketId]: { bucketId, apr, apy, fromBlock, toBlock },
            }
        }
    }

    const logs = await stakeLogsRepository.getAll(protocol)

    let stakeLogs: any[] = []
    if (logs && logs.length) {
        const firstItem = first(logs)!

        stakeLogs.push({
            timestamp:
                firstItem.timestamp - (firstItem.timestamp % 86400) - 86400,
            staked: 0,
        })

        stakeLogs.push(
            ...logs.map((item) => ({
                timestamp: item.timestamp,
                staked:
                    Number(item.staked) / 10 ** Number(stakingToken.decimals),
            }))
        )
    }

    return createReturn(
        200,
        JSON.stringify({ annualPercentageData, protocolInformation, stakeLogs })
    )
}
