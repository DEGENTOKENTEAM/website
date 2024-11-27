import { Handler } from 'aws-lambda'
import { omit } from 'lodash'
import { Chain, parseEventLogs } from 'viem'
import { chains } from '../../../shared/supportedChains'
import abi from '../../../src/abi/stakex/abi-ui.json'
import { StakeXProtocolLogsRepository } from '../../services/protocolLogs'
import { StakeXProtocolsRepository } from '../../services/protocols'

export const handler: Handler = async (_, __, callback) => {
    for (const chain of chains) await updateProtocolStatusByChain(chain)
    return callback()
}

export const updateProtocolStatusByChain = async (chain: Chain) => {
    const protocolLogsRepo = new StakeXProtocolLogsRepository()
    const protocolsRepo = new StakeXProtocolsRepository()
    const protocols = await protocolsRepo.getAllByChainId(chain.id)

    for (const protocol of protocols.items) {
        ///
        /// Update Enabled State
        ///
        if (!protocol.blockNumberEnabled) {
            const logsRaw =
                await protocolLogsRepo.getForProtocolSinceBlockNumber(
                    chain.id,
                    protocol.protocol,
                    0
                )

            const logs = parseEventLogs({
                abi: abi.filter(
                    (fragment) =>
                        fragment.type == 'event' && fragment.name == 'Enabled'
                ),
                logs: logsRaw.items
                    .sort((a, b) => (a.blockNumber > b.blockNumber ? 1 : -1))
                    .map((log) => ({ ...log.log })),
            })

            if (logs.length) {
                await protocolsRepo.update(
                    omit(
                        {
                            ...protocol,
                            blockNumberEnabled: Number(
                                logs[logs.length - 1].blockNumber
                            ),
                        },
                        'skey',
                        'pkey'
                    )
                )
            }
        }
    }
}
