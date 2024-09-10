import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Address, createPublicClient, http } from 'viem'
import { getChainById } from '../../../../shared/supportedChains'
import { TokenInfoResponse } from '../../../../src/types'
import { getCoingeckoDataViaProxy } from '../../../coingeckoProxy/get'
import { DynamoDBHelper } from '../../../helpers/ddb/dynamodb'
import { createReturn } from '../../../helpers/return'
import abi from './../../../../src/abi/stakex/abi-ui.json'
import { StakeXCustomizationResponseType } from './../../../../types/stakex'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { protocol, chainId } = event.pathParameters || {}
    if (protocol && chainId) {
        try {
            return createReturn(
                200,
                JSON.stringify(await fetchIpfsData(protocol, Number(chainId)))
            )
        } catch (e) {
            return createReturn(
                403,
                JSON.stringify({ message: (e as Error).message })
            )
        }
    }
    return createReturn(403, JSON.stringify({ message: 'INVALID_PARAMETERS' }))
}

export const fetchIpfsData = async (
    protocol: string,
    chainId: number,
    tokenInfo?: { symbol: string; source: string }
) => {
    const db = new DynamoDBHelper({ region: 'eu-west-1' })

    let response: StakeXCustomizationResponseType = {
        data: {
            projectName: null,
            logoUrl: null,
            logoUrlUpdatePending: false,
            stylesUrl: null,
            stylesUrlUpdatePending: false,
        },
    }

    const data = await db.query({
        TableName: process.env.DB_TABLE_NAME_STAKEX_CUSTOMIZATION,
        KeyConditionExpression: `#CustomizationKey = :CustomizationKey`,
        ExpressionAttributeNames: {
            [`#CustomizationKey`]: `CustomizationKey`,
        },
        ExpressionAttributeValues: {
            [`:CustomizationKey`]: protocol,
        },
        ConsistentRead: true,
    })

    // check customized ipfs data first
    if (data.Items && data.Items.length > 0) {
        const projectName = data.Items.at(0)!.projectName
            ? data.Items.at(0)!.projectName
            : null
        const logoUrlUpdatePending = Boolean(data.Items.at(0)!.logoIpfsNew)
        const logoUrl = data.Items.at(0)!.logoIpfs
            ? `https://ipfs.io/ipfs/${data.Items.at(0)!.logoIpfs}`
            : null

        const stylesUrlUpdatePending = Boolean(data.Items.at(0)!.stylesIpfsNew)
        const stylesUrl = data.Items.at(0)!.stylesIpfs
            ? `https://ipfs.io/ipfs/${data.Items.at(0)!.stylesIpfs}`
            : null

        response.data = {
            ...response.data,
            projectName,
            logoUrlUpdatePending,
            logoUrl,
            stylesUrlUpdatePending,
            stylesUrl,
        }
    }

    // check coingecko if there is no ipfs available
    if (!response.data.logoUrl || !response.data.projectName) {
        const chain = getChainById(chainId)

        if (!chain) throw Error('CHAIN_NOT_SUPPORTED')

        const client = createPublicClient({ chain, transport: http() })

        let stakingTokenData = tokenInfo
        if (!stakingTokenData) {
            try {
                const { symbol, source } = (await client.readContract({
                    abi,
                    address: protocol as Address,
                    functionName: 'getStakingToken',
                })) as TokenInfoResponse
                stakingTokenData = { symbol, source }
            } catch (e) {}
        }

        if (!stakingTokenData) throw Error('PROTOCOL_NOT_AVAILABLE')

        if (!response.data.projectName)
            response.data.projectName = `${stakingTokenData.symbol} staking`

        if (!response.data.logoUrl) {
            const cgdata = await getCoingeckoDataViaProxy(
                `api/v3/coins/id/contract/${stakingTokenData.source}`
            )
            if (cgdata && cgdata.image && cgdata.image.large)
                response.data.logoUrl = cgdata.image.large
        }
    }
    return response
}
