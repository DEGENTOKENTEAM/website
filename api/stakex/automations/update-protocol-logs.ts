import { Handler } from 'aws-lambda'

import { chunk, toLower } from 'lodash'
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
        transport: http(undefined, {
            fetchOptions: {
                headers: {
                    'Origin': 'https://dgnx.finance',
                },
            },
        }),
    })

    console.log(`Update ${protocols.count} protocol(s) on chain ${chain.name}`)

    const toBlock = await client.getBlockNumber()

    for (const protocol of protocols.items) {
        const fromBlock = BigInt(protocol.blockNumberLastUpdate)

        if (toBlock == fromBlock) continue

        // get all events from protocol
        // const logFilter = await client.createEventFilter({
        //     address: protocol.protocol as Address,
        //     events: abi.filter((item) => item.type == 'event'),
        //     fromBlock,
        //     toBlock,
        // })
        //
        // const logs = await client.getFilterLogs({ filter: logFilter })

        const logs = await client.getLogs({
            address: protocol.protocol as Address,
            events: abi.filter((item) => item.type == 'event'),
            fromBlock,
            toBlock,
        })

        // get unique tx hashes
        const txHashes = [...new Set(logs.map((log) => log.transactionHash))]

        const protocolLogs: StakeXProtocolLogsDTO[] = []

        for (const hash of txHashes) {
            const txReceipt = await client.getTransactionReceipt({ hash })
            const filteredLogs = txReceipt.logs.filter(
                (log) => toLower(log.address) == toLower(protocol.protocol)
            )
            for (const log of filteredLogs) {
                protocolLogs.push({
                    chainId: client.chain.id,
                    protocol: toLower(protocol.protocol),
                    blockNumber: Number(log.blockNumber),
                    txHash: log.transactionHash,
                    logIndex: log.logIndex,
                    log,
                })
            }
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
                protocol: toLower(protocol.protocol),
                blockNumberLastUpdate: Number(toBlock),
            })
        } catch (e) {
            console.error('Error creating batch', e)
        }
    }
}
