import { Handler } from 'aws-lambda'
import { chunk, toLower } from 'lodash'
import { Address, Chain, createPublicClient, http } from 'viem'
import { chains } from '../../../shared/supportedChains'
import abi from '../../../src/abi/stakex/abi-ui.json'
import {
    StakeXCampaignsDeleteDTO,
    StakeXCampaignsDTO,
    StakeXCampaignsRepository,
} from '../../services/campaigns'
import { StakeXProtocolsRepository } from '../../services/protocols'

export const handler: Handler = async (_, __, callback) => {
    for (const chain of chains) await updateCampaignsByChain(chain)
    return callback()
}

export const updateCampaignsByChain = async (chain: Chain) => {
    const protocolsRepo = new StakeXProtocolsRepository()
    const campaignsRepo = new StakeXCampaignsRepository()

    const client = createPublicClient({
        chain,
        transport: http(),
    })

    const protocolData = await protocolsRepo.getAllCampaignsByChainId(
        Number(chain.id),
        1000
    )

    for (const protocol of protocolData.items) {
        let allCampaignsLive = []
        try {
            allCampaignsLive = (await client.readContract({
                abi,
                address: protocol.protocol as Address,
                functionName: 'stakeXGetAllCampaignsData',
            })) as any[]
        } catch (e) {}

        const liveIds = allCampaignsLive.map(
            (campaign) => campaign.config.bucketId
        )

        const allCampaignsStored = await campaignsRepo.listByChainIdAndProtocol(
            chain.id,
            toLower(protocol.protocol),
            1000
        )

        const storedIds = allCampaignsStored.items.map(
            (campaign) => campaign.bucketId
        )

        let updateCampaigns: StakeXCampaignsDTO[] = []
        for (const campaign of allCampaignsLive) {
            updateCampaigns.push({
                protocol: toLower(protocol.protocol),
                owner: toLower(protocol.owner!),
                chainId: chain.id,
                bucketId: campaign.config.bucketId,
                created: campaign.config.createdTimestamp,
                opened: campaign.config.openTimestamp,
                period: campaign.config.period,
                name: campaign.config.name,
                rewardAmount: campaign.config.rewardAmount,
                initialRewardAmount: campaign.config.initialRewardAmount,
                rewardSymbol: campaign.stats.rewardToken.symbol,
                rewardDecimals: campaign.stats.rewardToken.decimals,
                stakingSymbol: campaign.stats.stakingToken.symbol,
                stakingDecimals: campaign.stats.stakingToken.decimals,
                started: campaign.config.startTimestamp,
            })
        }

        let deleteCampaigns: StakeXCampaignsDeleteDTO[] = []
        for (const bucketId of storedIds)
            if (!liveIds.includes(bucketId))
                deleteCampaigns.push({
                    bucketId,
                    protocol: protocol.protocol,
                    chainId: chain.id,
                })

        if (deleteCampaigns.length) {
            const deleteChunks = chunk(deleteCampaigns, 25)
            for (const deleteChunk of deleteChunks) {
                if (deleteChunk.length) {
                    await campaignsRepo.deleteBatch(deleteCampaigns)
                }
            }
        }

        if (updateCampaigns.length) {
            const updateChunks = chunk(updateCampaigns, 25)
            for (const updateChunk of updateChunks) {
                if (updateChunk.length) {
                    await campaignsRepo.createBatch(updateCampaigns)
                }
            }
        }
    }
}
