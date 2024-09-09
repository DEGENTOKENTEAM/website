import { Handler } from 'aws-lambda'
import { omit } from 'lodash'
import { createPublicClient, http, parseEventLogs } from 'viem'
import {
    arbitrum,
    avalanche,
    base,
    bsc,
    mainnet,
    optimism,
    polygon,
} from 'viem/chains'
import protocols from '../../../config/protocols'
import { chains } from '../../../shared/supportedChains'
import {
    StakeXChainSyncDTO,
    StakeXChainSyncDTOResponse,
    StakeXChainSyncRepository,
} from '../../services/chainSync'
import {
    StakeXProtocolsDTO,
    StakeXProtocolsRepository,
} from '../../services/protocols'

const abi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'deployer',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'protocol',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'referral',
                type: 'address',
            },
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'amountSent',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'referrerShare',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'feeCharged',
                        type: 'uint256',
                    },
                ],
                indexed: false,
                internalType: 'struct DeployerStakeXFacet.DeployedEvent',
                name: 'deployEvent',
                type: 'tuple',
            },
        ],
        name: 'StakeXProtocolDeployed',
        type: 'event',
    },
]

const chainAPUpdateInterval: { [key: number]: number } = {
    [avalanche.id]: 43200, // daily
    [mainnet.id]: 7200, // daily
    [base.id]: 43200, // daily
    [polygon.id]: 39272, // daily
    [arbitrum.id]: 288000, // daily
    [bsc.id]: 28800, // daily
    [optimism.id]: 43200, // daily
}
const chainAPPeriod: { [key: number]: number } = {
    [avalanche.id]: 907200, // 3 weeks
    [mainnet.id]: 151200, // 3 weeks
    [base.id]: 907200, // 3 weeks
    [polygon.id]: 816480, // 3 weeks
    [arbitrum.id]: 6048000, // 3 weeks
    [bsc.id]: 604800, // 3 weeks
    [optimism.id]: 907200, // 3 weeks
}

export const handler: Handler = async (_, __, callback) => {
    let success = true
    for (const chain of chains) {
        const chainId = chain.id
        const client = createPublicClient({
            chain,
            transport: http(),
        })

        if (!protocols[chainId] || !protocols[chainId].deployer) continue

        const { deployer } = protocols[chainId]

        const chainSyncRepo = new StakeXChainSyncRepository()

        let item: Partial<StakeXChainSyncDTOResponse> | null =
            await chainSyncRepo.getByChainId(chain.id)

        if (item?.running && item?.lastSucceed) continue

        const blockNumber = Number(await client.getBlockNumber())

        let fromBlock =
            item && item.blockNumber
                ? item.blockNumber
                : blockNumber - Math.floor(blockNumber / 1000)

        if (!item) {
            item = {
                blockNumber,
                chainId,
                error: '',
                lastSucceed: 0,
                successful: false,
            }
        }

        item = {
            ...item,
            lastRunning: Math.ceil(Date.now() / 1000),
            running: true,
        }

        await chainSyncRepo.bump(
            omit(item, 'pkey', 'skey') as StakeXChainSyncDTO
        )

        const logRequest = {
            address: deployer,
            abi,
            fromBlock: BigInt(fromBlock),
            toBlock: BigInt(blockNumber),
            eventName: 'StakeXProtocolDeployed',
        }

        let logs: any[] = []
        let error = ''
        let successful = true

        try {
            const logsRaw = await client.getContractEvents(logRequest)
            logs = parseEventLogs({
                abi,
                logs: logsRaw,
            })
        } catch (e) {
            successful = false
            error = (e as Error).message
            console.error(error)
        }

        const protocolBatch: StakeXProtocolsDTO[] = []
        for (const log of logs as any[])
            protocolBatch.push({
                chainId,
                protocol: log.args.protocol,
                timestamp: Math.ceil(Date.now() / 1000),
                blockNumberCreated: Number(log.blockNumber),
                blockNumberEnabled: 0,
                blockNumberAPUpdate: 0,
                blockNumberStakesUpdate: 0,
                blockNumberAPUpdateIntervall: chainAPUpdateInterval[chainId],
                blockNumberAPPeriod: chainAPPeriod[chainId],
            })

        if (protocolBatch.length) {
            const protocolsRepo = new StakeXProtocolsRepository()
            await protocolsRepo.createBatch(protocolBatch)
        }

        await chainSyncRepo.bump(
            omit(
                {
                    ...item,
                    error,
                    running: false,
                    lastSucceed: Math.ceil(Date.now() / 1000),
                    blockNumber,
                    successful,
                },
                'pkey',
                'skey'
            ) as StakeXChainSyncDTO
        )

        if (!successful) success = successful
    }

    return callback(null, { success })
}
