import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import fetch from 'node-fetch'
import { createReturn } from '../helpers/return'
import { CoingeckoApiCacheRepository } from '../services/coingeckoApiCache'
import { toLower } from 'lodash'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const path = event.pathParameters || {}

    if (!path || !path.proxyPath) return createReturn(404, JSON.stringify(null))

    const requestPath = path.proxyPath

    return createReturn(
        200,
        JSON.stringify(await getCoingeckoDataViaProxy(requestPath))
    )
}

export const getCoingeckoDataViaProxy = async (path: string): Promise<any> => {
    // check cache
    const requestPath = toLower(path)
    const cacheDB = new CoingeckoApiCacheRepository()
    let responseData = await cacheDB.get(requestPath)
    if (!responseData) {
        const resultRaw = await fetch(
            `https://api.coingecko.com/${requestPath}`
        )
        responseData = (await resultRaw.json()) as any
        await cacheDB.create({
            requestPath,
            responseData,
        })
    }
    return responseData
}
