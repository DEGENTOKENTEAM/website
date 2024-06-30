import { Callback, Handler } from 'aws-lambda'
import { Address, createPublicClient, http } from 'viem'
import { chainByChainId } from '../../../shared/supportedChains'
import abi from './../../../src/abi/stakex/abi-ui.json'
import { avalanche, avalancheFuji, mainnet } from 'viem/chains'
// TODO maybe rename it in log APR

type CalculateAprEventType = {
    fromBlock: number
    chainId: number
    protocol: Address
}

const abiEvents = [
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

const blockScanPerChain: { [key: number]: number } = {
    [avalanche.id]: 1000,
    [avalancheFuji.id]: 10,
    [mainnet.id]: 300,
}

export const handler: Handler<CalculateAprEventType> = async (event, _, cb) => {
    const { chainId, protocol: address, fromBlock } = event

    if (!chainId) return cb('MISSING_CHAIN_ID')
    if (!fromBlock) return cb('MISSING_FROM_BLOCK')
    if (!address) return cb('MISSING_PROTOCOL_ADDRESS')

    const chain = chainByChainId(chainId)

    if (!chain) return cb('UNSUPPORTED_CHAIN')

    const client = createPublicClient({
        chain,
        transport: http('https://avalanche.public-rpc.com'),
    })

    let isRunningContract = false
    try {
        isRunningContract = (await client.readContract({
            abi,
            address,
            functionName: 'isRunning',
        })) as boolean
        if (!isRunningContract) return cb('NOT_RUNNING')
    } catch (e) {
        return cb((e as Error).message)
    }

    const latestBlock = await client.getBlock()
    // const nextBlockForScan = latestBlock.number + blockScanPerChain[chain.id]

    // get regular event
    const logs = await client.getContractEvents({
        address,
        abi: abiEvents,
        // fromBlock,
        eventName: 'Enabled',
    })

    let startBlock: bigint | null | undefined = logs.at(
        logs.length - 1
    )?.blockNumber

    // startBlock = null

    // if (!startBlock) {
    //     const logs = await client.getContractEvents({
    //         address,
    //         abi: abiEvents,
    //         fromBlock,
    //         eventName: 'UpdatedActiveBlock',
    //     })
    //     startBlock = (logs.at(logs.length - 1) as any)?.args.chosenBlock
    // }

    // if (!startBlock) {
    //     const logs = await client.getContractEvents({
    //         address,
    //         abi: abiEvents,
    //         fromBlock,
    //         eventName: 'UpdatedActiveTime',
    //     })
    //     const startTime = (logs.at(logs.length - 1) as any)?.args.chosenTime
    //     if (startTime && latestBlock.timestamp < startTime) {
    //         startBlock = latestBlock.number
    //     }
    // }

    {
        const logs = await client.getContractEvents({
            address,
            abi: abiEvents,
            // fromBlock,
            eventName: 'UpdatedActiveTime',
        })
    }

    // if (!startBlock) {}

    // if () {

    // }

    // let logsTimeActivation = await client.getContractEvents({
    //     address,
    //     abi,
    //     fromBlock,
    //     eventName: 'Enabled',
    // })

    // get timebase event
    // get block based event
}
