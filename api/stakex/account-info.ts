import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Address } from 'viem'
import { createReturn } from '../helpers/return'
import { StakeXProtocolsRepository } from '../services/protocols'
import { toLower } from 'lodash'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const protocolsRepo = new StakeXProtocolsRepository()
    const { account: _account } = event.pathParameters || {}
    const account = _account as Address
    const campaigns = await protocolsRepo.getAllCampaignsByOwnerAddress(
        toLower(account) as Address
    )
    const regulars = await protocolsRepo.getAllRegularsByOwnerAddress(
        toLower(account) as Address
    )
    return createReturn(200, JSON.stringify({ campaigns, regulars }))
}
