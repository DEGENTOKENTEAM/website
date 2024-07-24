import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import fetch from 'node-fetch'
import { createReturn } from '../helpers/return'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const path = event.pathParameters || {}
    const resultRaw = await fetch(`https://api.coingecko.com/${path.proxyPath}`)
    const result = (await resultRaw.json()) as any

    console.log({ path: `${path.proxyPath}`, result })
    // if (result.message === 'OK')
    return createReturn(200, JSON.stringify(result), 60 * 60 * 24 * 7)

    // return createReturn(403, JSON.stringify(result))
}
