import { Handler } from 'aws-lambda'
import { createPublicClient, http } from 'viem'
import protocols from '../../../config/protocols'
import { chains } from '../../../shared/supportedChains'

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

export const handler: Handler = async (event, context) => {
    // BUILD LATER
    for (const chain of chains) {
        // const [rpc] = chain.rpcUrls.default.http
        const rpc = 'http://127.0.0.1:8545'

        console.log({ rpc })

        const client = createPublicClient({
            chain,
            transport: http(rpc),
        })

        if (!protocols[client.chain.id] || !protocols[client.chain.id].deployer)
            continue

        const deployer = protocols[client.chain.id].deployer

        // TODO replace block number with stored data information based on chain id
        const fromBlock = 46091259

        const deployLogs = await client.getContractEvents({
            address: deployer,
            abi,
            fromBlock: BigInt(fromBlock),
            eventName: 'StakeXProtocolDeployed',
        })

        console.log({ chainId: chain.id, deployLogs })
    }

    // gather new protocols
    // check outstanding protocols if they are activated
    // initiate apr calculation
    // ---- NICE NICE NICE NICE NICE NICE NICE NICE NICE NICE NICE NICE
    // initiate staking stats
    //
}
