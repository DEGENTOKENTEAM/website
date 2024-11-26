// On-chain APR calculation is possible when
// - Staking tokens and reward tokens are exchangeable to the same currency (like USDC, or the staking token itself)

import { Handler } from 'aws-lambda'
import { chunk, isUndefined } from 'lodash'
import { Address, Chain, createPublicClient, http, parseEventLogs } from 'viem'
import { chains } from '../../../../shared/supportedChains'
import abi from '../../../../src/abi/stakex/abi-ui.json'
import { StakeXProtocolLogsRepository } from '../../../services/protocolLogs'
import { StakeXProtocolsRepository } from '../../../services/protocols'
import {
    StakeXStakeLogsDTO,
    StakeXStakeLogsRepository,
} from '../../../services/stakeLogs'

export const handler: Handler = async (_, __, callback) => {
    for (const chain of chains) await calculateStakesForChain(chain)
    return callback()
}

// - Staking token is the only reward token
export const calculateStakesForChain = async (chain: Chain) => {
    const protocolsRepo = new StakeXProtocolsRepository()
    const protocolLogsRepo = new StakeXProtocolLogsRepository()
    const stakeLogsRepo = new StakeXStakeLogsRepository()
    const client = createPublicClient({ chain, transport: http() })

    // get protocols from chain
    const protocols = await protocolsRepo.getAllRegularsByChainId(chain.id)

    const events = [
        'Staked',
        'Unstaked',
        'Restaked',
        'AddedUp',
        'Merged',
        'Upstaked',
    ]

    // walk through every protocol and check for new logs
    for (const protocol of protocols.items) {
        let blockNumberStakesUpdate = protocol.blockNumberStakesUpdate || 0

        const logsRaw = await protocolLogsRepo.getForProtocolSinceBlockNumber(
            protocol.chainId,
            protocol.protocol,
            blockNumberStakesUpdate
        )

        const logs = parseEventLogs({
            abi: abi.filter(
                (fragment) =>
                    fragment.type == 'event' && events.includes(fragment.name)
            ),
            logs: logsRaw.items
                .sort((a, b) => (a.blockNumber > b.blockNumber ? 1 : -1))
                .map((log) => ({ ...log.log })),
        })

        const blockNumbers = [...new Set(logs.map((log) => log.blockNumber))]
        const batch: StakeXStakeLogsDTO[] = []
        for (const blockNumber of blockNumbers) {
            const stakingData: any = await client.readContract({
                abi,
                address: protocol.protocol as Address,
                functionName: 'getStakingData',
                blockNumber,
            })

            batch.push({
                blockNumber: Number(blockNumber),
                chainId: protocol.chainId,
                protocol: protocol.protocol,
                staked: stakingData.staked.amount,
                timestamp: Boolean(stakingData.blockTimestamp)
                    ? stakingData.blockTimestamp
                    : Date.now() / 1000,
            })

            if (Number(blockNumber) > blockNumberStakesUpdate)
                blockNumberStakesUpdate = Number(blockNumber)
        }

        if (batch.length > 0) {
            const chunks = chunk(batch, 25)
            for (const batchChunk of chunks) {
                if (batchChunk.length > 0) {
                    await stakeLogsRepo.createBatch(batchChunk)
                }
            }
        }

        if (
            !isUndefined(protocol.blockNumberStakesUpdate) &&
            protocol.blockNumberStakesUpdate < blockNumberStakesUpdate
        ) {
            await protocolsRepo.update({
                protocol: protocol.protocol,
                chainId: protocol.chainId,
                blockNumberStakesUpdate,
            })
        }
    }
}
