import { Handler } from 'aws-lambda'
import { omit } from 'lodash'
import { Address, createPublicClient, http, parseEventLogs } from 'viem'
import { chains } from '../../../shared/supportedChains'
import { StakeXProtocolsRepository } from '../../services/protocols'
import abi from './../../../src/abi/stakex/abi-ui.json'

export const handler: Handler = async (_, __, callback) => {
    const protocolsRepo = new StakeXProtocolsRepository()
    for (const chain of chains) {
        const protocols = await protocolsRepo.getAllDisabledByChainId(chain.id)
        const client = createPublicClient({
            chain,
            transport: http(),
        })
        for (const protocol of protocols.items) {
            const { protocol: address, blockNumberCreated } = protocol
            const logs = parseEventLogs({
                abi,
                logs: await client.getContractEvents({
                    address: address as Address,
                    abi,
                    fromBlock: BigInt(blockNumberCreated!),
                    eventName: 'Enabled',
                }),
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
    return callback()
}
