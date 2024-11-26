import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import fetch from 'node-fetch'
import { Address, createPublicClient, http } from 'viem'
import { getChainById } from '../../../shared/supportedChains'
import { TokenInfoResponse } from '../../../src/types'
import { getCoingeckoDataViaProxy } from '../../coingeckoProxy/get'
import { createReturn } from '../../helpers/return'
import {
    StakeXPeripheryRepository,
    StakeXPeripheryResponse,
} from '../../services/periphery'
import abi from './../../../src/abi/stakex/abi-ui.json'
import { IpfsDataStorageType } from './update'

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
    let response = {
        data: {
            projectName: null,
            heroBannerUrl: null,
            projectLogoUrl: null,
            pending: false,
        } as {
            projectName: string | null
            heroBannerUrl: string | null
            projectLogoUrl: string | null
            pending: boolean
        },
    }

    const peripheryRepository = new StakeXPeripheryRepository()

    let manifestInfo: Partial<StakeXPeripheryResponse> | null =
        await peripheryRepository.read(chainId, protocol as Address)

    if (manifestInfo) {
        const res = await fetch(
            `https://ipfs.io/ipfs/${manifestInfo.manifestCID}`
        )
        if (res.status !== 200) {
            response.data.pending = true
            return response
        }

        let manifestData = (await res.json()) as IpfsDataStorageType

        response.data.projectName = manifestData.projectName
            ? manifestData.projectName
            : null

        response.data.heroBannerUrl = manifestData.heroBannerCID
            ? manifestData.heroBanner
            : null

        response.data.projectLogoUrl = manifestData.projectLogoCID
            ? manifestData.projectLogo
            : null

        response.data.pending =
            Boolean(manifestInfo.manifestCIDNext) &&
            manifestInfo.manifestCID != manifestInfo.manifestCIDNext
    }

    // if there is no logo url, check coingecko for logo
    if (!response.data.projectLogoUrl || !response.data.projectName) {
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
            } catch (e) {
                console.log('error', e)
            }
        }

        if (stakingTokenData) {
            if (!response.data.projectName)
                response.data.projectName = `${stakingTokenData.symbol} staking`

            if (!response.data.projectLogoUrl) {
                const cgdata = await getCoingeckoDataViaProxy(
                    `api/v3/coins/id/contract/${stakingTokenData.source}`
                )
                if (cgdata && cgdata.image && cgdata.image.large)
                    response.data.projectLogoUrl = cgdata.image.large
            }
        }
    }
    return response
}
