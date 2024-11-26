import { Handler } from 'aws-lambda'
import { chunk, omit, toLower } from 'lodash'
import { PinataSDK } from 'pinata-web3'
import { createPublicClient, http } from 'viem'
import { getChainById } from '../../shared/supportedChains'
import { DynamoDBHelper } from '../helpers/ddb/dynamodb'
import {
    StakeXAnnualsCreateDTO,
    StakeXAnnualsRepository,
} from '../services/annuals'
import {
    StakeXChainSyncDTO,
    StakeXChainSyncRepository,
} from '../services/chainSync'
import { StakeXPeripheryRepository } from '../services/periphery'
import {
    StakeXProtocolsDTO,
    StakeXProtocolsRepository,
} from '../services/protocols'
import {
    StakeXStakeLogsDTO,
    StakeXStakeLogsRepository,
} from '../services/stakeLogs'
import abi from './../../src/abi/stakex/abi-ui.json'

export const handler: Handler = async (_, __, callback) => {
    const pkey = 'v_1'
    const stagePrefixFrom = 'dgnx-website-production'

    console.log(`Start Migration`)

    const db = new DynamoDBHelper({
        region: 'eu-west-1',
    })

    //
    // update chain sync: 1to1
    //
    console.log(`Migrate Chain Sync Data`)
    {
        const tableFrom = `${stagePrefixFrom}-stakexChainSync`
        const chainSyncRepo = new StakeXChainSyncRepository()

        const dataFrom = await db.query({
            TableName: tableFrom,
            KeyConditionExpression: '#pkey = :pkey',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
            },
            ConsistentRead: true,
        })

        console.log(`Received Chain Sync Data`)
        if (dataFrom && dataFrom.Items && dataFrom.Items.length) {
            for (const item of dataFrom.Items) {
                await chainSyncRepo.bump(
                    omit(item, ['pkey', 'skey']) as StakeXChainSyncDTO
                )
                console.log(`Migrated chain ${item.chainId}`)
            }
        }
        console.log(`Migrated Chain Sync Data`)
    }

    //
    // update stakex protocols
    //
    // old fields: pkey,skey,blockNumberAPPeriod,blockNumberAPUpdate,blockNumberAPUpdateIntervall,                           blockNumberCreated,blockNumberEnabled,                      blockNumberStakesUpdate,chainId,                     protocol,timestamp
    // new fields: pkey,skey,blockNumberAPPeriod,blockNumberAPUpdate,blockNumberAPUpdateIntervall,blockNumberCampaignsUpdate,blockNumberCreated,blockNumberEnabled,blockNumberLastUpdate,blockNumberStakesUpdate,chainId,isCampaignMode,owner,protocol,timestamp
    //
    // added new fields:
    // - blockNumberCampaignsUpdate
    // - blockNumberLastUpdate
    // - isCampaignMode
    // - owner
    //
    const protocolDataForLater: { chainId: number; protocol: string }[] = []
    console.log(`Migrate StakeX Protocols`)
    {
        const tableFrom = `${stagePrefixFrom}-stakexProtocols`
        const protocolsRepo = new StakeXProtocolsRepository()

        const dataFrom = await db.query({
            TableName: tableFrom,
            KeyConditionExpression: '#pkey = :pkey',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
            },
            ConsistentRead: true,
        })

        console.log(`Received StakeX Protocols Data`)

        if (dataFrom.Items) {
            console.log(`Enrich StakeX Protocols Data`)
            for (const data of dataFrom.Items) {
                const client = createPublicClient({
                    chain: getChainById(Number(data.chainId)),
                    transport: http(),
                })

                const owner = await client.readContract({
                    abi,
                    address: data.protocol,
                    functionName: 'contractOwner',
                })

                await protocolsRepo.createBatch([
                    {
                        ...(omit(data, ['pkey', 'skey']) as StakeXProtocolsDTO),
                        blockNumberCampaignsUpdate: 0,
                        blockNumberLastUpdate: 0,
                        isCampaignMode: false,
                        owner: owner as unknown as string,
                    },
                ])

                console.log(
                    `Migrated StakeX Protocol Data for ${data.protocol}`
                )

                protocolDataForLater.push({
                    chainId: Number(data.chainId),
                    protocol: data.protocol,
                })
            }

            console.log(`Migrated StakeX Protocols Data`)
        }
    }

    //
    // update manifests / customizations: create new json in ipfs
    //
    // >> new fields: skey (chainId#protocol), manifestCID, manifestCIDNext, chainId, protocol
    // >> old fields: CustomizationKey >> protocol
    //
    // get chainID from protocols list
    console.log(`Migrate Manifests for Protocols`)
    {
        const pinata = new PinataSDK({
            pinataJwt: `${process.env.PINATA_API_KEY}`,
            pinataGateway: `${process.env.PINATA_GATEWAY}`,
        })

        const tableFrom = `${stagePrefixFrom}-stakexCustomization`

        const peripheryRepo = new StakeXPeripheryRepository()

        if (protocolDataForLater.length) {
            console.log(`Process recent collected protocol data`)

            for (const protocolData of protocolDataForLater) {
                const { protocol, chainId } = protocolData
                const dataFrom = await db.query({
                    TableName: tableFrom,
                    KeyConditionExpression:
                        '#CustomizationKey = :CustomizationKey',
                    ExpressionAttributeNames: {
                        '#CustomizationKey': 'CustomizationKey',
                    },
                    ExpressionAttributeValues: {
                        ':CustomizationKey': protocol,
                    },
                    ConsistentRead: true,
                })

                // when there is a record for this protocol, migrate ipfs data
                if (
                    dataFrom.Count &&
                    dataFrom.Items &&
                    dataFrom.Items?.length
                ) {
                    console.log(`Got data for ${protocol}`)

                    const item = dataFrom.Items[0]

                    console.log(`Upload new data to IPFS`)

                    const { IpfsHash } = await pinata.upload
                        .json({
                            heroBanner: '',
                            heroBannerCID: '',
                            projectLogo: `https://ipfs.io/ipfs/${item.logoIpfs}`,
                            projectLogoCID: item.logoIpfs,
                            projectName: '',
                        })
                        .addMetadata({
                            keyValues: {
                                protocol,
                                chainId,
                            },
                            name: `manifest.json`,
                        })

                    console.log(`Uploaded with ${IpfsHash}`)

                    await peripheryRepo.createBatch([
                        {
                            protocol,
                            chainId,
                            manifestCID: '',
                            manifestCIDNext: IpfsHash,
                        },
                    ])

                    console.log(
                        `Updated manifest for ${protocol} with ${IpfsHash}`
                    )
                } else console.log(`NO data for ${protocol}`)
            }
        } else console.log(`No data to migrate`)

        console.log(`Finished Magration of Manifests for Protocols`)
    }

    //
    // update apr logs: new skey and chainId being added
    //
    // >> old fields: pkey,skey,apr,apy,blockNumber,bucketId,        fromBlock,protocol,timestamp,toBlock
    // >> new fields: pkey,skey,apr,apy,            bucketId,chainId,fromBlock,protocol,timestamp,toBlock (remove blockNumber, add chainId , use new skey: chainId#protocol#bucketId#timestamp)
    //
    console.log(`Migrate APR Logs`)
    {
        const tableFrom = `${stagePrefixFrom}-stakexAnnualPercentageLogs`
        const annualsRepo = new StakeXAnnualsRepository()

        const dataFrom = await db.query({
            TableName: tableFrom,
            KeyConditionExpression: '#pkey = :pkey',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
            },
            ConsistentRead: true,
        })

        const updatedItems: StakeXAnnualsCreateDTO[] =
            (dataFrom.Count &&
                dataFrom.Items &&
                dataFrom.Items.map((item) => {
                    const chainId = protocolDataForLater.find(
                        (data) =>
                            toLower(data.protocol) == toLower(item.protocol)
                    )?.chainId
                    return {
                        ...(omit(item, [
                            'blockNumber',
                        ]) as StakeXAnnualsCreateDTO),
                        chainId: chainId!,
                        skey: `${chainId}#${item.protocol}#${item.bucketId}#${item.timestamp}`,
                    }
                })) ||
            []

        const total = updatedItems.length
        console.log(`Migrate ${total} log entries in total`)
        if (total) {
            let items = 0
            const chunkUpdatedItems = chunk(updatedItems, 25)
            for (const chunkUpdatedItem of chunkUpdatedItems) {
                items += chunkUpdatedItem.length
                if (chunkUpdatedItem.length) {
                    await annualsRepo.createBatch(chunkUpdatedItem)
                    console.log(`Migrated ${items} of ${total}`)
                }
            }
        }

        console.log(`Finished Magration of APR Logs`)
    }

    //
    // update stake logs: new skey and chainId being added
    //
    {
        const tableFrom = `${stagePrefixFrom}-stakexStakeLogs`
        const stakeLogsRepo = new StakeXStakeLogsRepository()

        const dataFrom = await db.query({
            TableName: tableFrom,
            KeyConditionExpression: '#pkey = :pkey',
            ExpressionAttributeNames: {
                '#pkey': 'pkey',
            },
            ExpressionAttributeValues: {
                ':pkey': pkey,
            },
            ConsistentRead: true,
        })

        const updatedItems: StakeXStakeLogsDTO[] =
            (dataFrom.Count &&
                dataFrom.Items &&
                dataFrom.Items.map((item) => {
                    const chainId = protocolDataForLater.find(
                        (data) =>
                            toLower(data.protocol) == toLower(item.protocol)
                    )?.chainId
                    return {
                        ...(omit(item, [
                            'blockNumber',
                            'skey',
                            'pkey',
                        ]) as StakeXStakeLogsDTO),
                        chainId: chainId!,
                    }
                })) ||
            []

        const total = updatedItems.length
        console.log(`Migrate ${total} stake log entries in total`)
        if (total) {
            let items = 0
            const chunkUpdatedItems = chunk(updatedItems, 25)
            for (const chunkUpdatedItem of chunkUpdatedItems) {
                items += chunkUpdatedItem.length
                if (chunkUpdatedItem.length) {
                    await stakeLogsRepo.createBatch(chunkUpdatedItem)
                    console.log(`Migrated ${items} of ${total}`)
                }
            }
        }

        console.log(`Finished Magration of Stake Logs`)
    }

    console.log(`Finish Migration`)

    callback()
}
