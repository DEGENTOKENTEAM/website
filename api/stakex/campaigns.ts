import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { isNumber, omit, toLower } from 'lodash'
import { Address, isAddress } from 'viem'
import { createReturn } from '../helpers/return'
import { StakeXCampaignsRepository } from '../services/campaigns'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    let { chainId: _chainId, account: _account } = event.pathParameters || {}
    const chainId = Number(_chainId)
    const account =
        _account && isAddress(_account) ? (toLower(_account) as Address) : null

    const campaignsRepository = new StakeXCampaignsRepository()

    const campaigns = account
        ? await campaignsRepository.listByOwner(account)
        : isNumber(chainId) && chainId > 0
        ? await campaignsRepository.listByChainId(chainId, 100)
        : await campaignsRepository.list(100)

    if (!campaigns.count) return createReturn(200, JSON.stringify([]))

    return createReturn(
        200,
        JSON.stringify(
            campaigns.items.map((item) => omit(item, ['pkey', 'skey'])),
            (_, value) => (typeof value === 'bigint' ? value.toString() : value)
        )
    )
}
