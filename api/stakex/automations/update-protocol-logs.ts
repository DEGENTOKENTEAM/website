import { Handler } from 'aws-lambda'

import { chunk, get } from 'lodash'
import { Address, Chain, createPublicClient, http } from 'viem'
import { chains } from '../../../shared/supportedChains'
import {
    StakeXProtocolLogsDTO,
    StakeXProtocolLogsRepository,
} from '../../services/protocolLogs'
import { StakeXProtocolsRepository } from '../../services/protocols'
import abi from './../../../src/abi/stakex/abi-ui.json'

export const handler: Handler = async (_, __, callback) => {
    for (const chain of chains) await updateProtocolLogsByChain(chain)
    return callback()
}

export const updateProtocolLogsByChain = async (chain: Chain) => {
    const protocolsRepo = new StakeXProtocolsRepository()
    const protocolLogsRepo = new StakeXProtocolLogsRepository()
    const protocols = await protocolsRepo.getAllByChainId(chain.id, 1000)
    const client = createPublicClient({
        chain,
        transport: http(),
    })

    const toBlock = await client.getBlockNumber()

    for (const protocol of protocols.items) {
        const fromBlock = BigInt(protocol.blockNumberLastUpdate)

        if (toBlock == fromBlock) continue

        // get all events from protocol
        const logFilter = await client.createEventFilter({
            address: protocol.protocol as Address,
            events: abi.filter((item) => item.type == 'event'),
            fromBlock,
            toBlock,
        })

        const protocolLogs: StakeXProtocolLogsDTO[] = []

        const logs = await client.getFilterLogs({ filter: logFilter })

        for (const log of logs as any[]) {
            protocolLogs.push({
                chainId: client.chain.id,
                protocol: protocol.protocol,
                blockNumber: Number(log.blockNumber),
                txHash: log.transactionHash,
                logIndex: log.logIndex,
                log,
            })
        }

        try {
            // add logs for this protocol
            if (protocolLogs.length) {
                const chunks = chunk(protocolLogs, 25)
                for (const chunk of chunks)
                    if (chunk.length > 0)
                        await protocolLogsRepo.createBatch(chunk)
            }

            // update to latest block number
            await protocolsRepo.update({
                chainId: client.chain.id,
                protocol: protocol.protocol,
                blockNumberLastUpdate: Number(toBlock),
            })
        } catch (e) {
            console.error('Error creating batch', e)
        }
    }
}
