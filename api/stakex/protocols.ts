import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { cloneDeep, isNumber } from 'lodash'
import { createPublicClient, http, zeroAddress } from 'viem'
import { getChainById } from '../../shared/supportedChains'
import { ProtocolsResponse } from '../../shared/types'
import { createReturn } from '../helpers/return'
import { StakeXAnnualsRepository } from '../services/annuals'
import { StakeXProtocolsRepository } from '../services/protocols'
import abi from './../../src/abi/stakex/abi-ui.json'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { chainId } = event.pathParameters || {}
    const protocolResponseBlank: ProtocolsResponse = {
        protocol: {
            apr: { avg: 0, high: Number.MIN_VALUE, low: Number.MAX_VALUE },
            apy: { avg: 0, high: Number.MIN_VALUE, low: Number.MAX_VALUE },
            logo: '',
            name: '',
            stakedAbs: '',
            stakedRel: 0,
            stakers: 0,
            stakes: 0,
            source: zeroAddress,
            chainId: 0,
        },
        token: { decimals: 0, symbol: '' },
    }

    const lambdaClient = new LambdaClient()
    const annualsRepository = new StakeXAnnualsRepository({})
    const protocolsRepository = new StakeXProtocolsRepository({})

    const protocols =
        isNumber(chainId) && chainId > 0
            ? await protocolsRepository.getAllByChainId(chainId, 100) // show first 100 entries
            : await protocolsRepository.getAll(100) // show first 100 entries

    if (!protocols.count) return createReturn(200, JSON.stringify({}))

    const ret: ProtocolsResponse[] = []
    for (const item of protocols.items) {
        const { protocol, chainId, blockNumberAPUpdate } = item

        const protocolResponse = cloneDeep(protocolResponseBlank)

        protocolResponse.protocol.source = protocol
        protocolResponse.protocol.chainId = Number(chainId)

        //
        // APR & APY
        //
        const annuals = await annualsRepository.getByProtocolAndBlockNumber(
            protocol,
            blockNumberAPUpdate
        )

        if (protocols.count) {
            for (const annual of annuals.items) {
                protocolResponse.protocol.apr.high =
                    annual.apr > protocolResponse.protocol.apr.high
                        ? annual.apr
                        : protocolResponse.protocol.apr.high

                protocolResponse.protocol.apr.low =
                    annual.apr < protocolResponse.protocol.apr.low
                        ? annual.apr
                        : protocolResponse.protocol.apr.low

                protocolResponse.protocol.apy.high =
                    annual.apy > protocolResponse.protocol.apy.high
                        ? annual.apy
                        : protocolResponse.protocol.apy.high

                protocolResponse.protocol.apy.low =
                    annual.apy < protocolResponse.protocol.apy.low
                        ? annual.apy
                        : protocolResponse.protocol.apy.low
            }

            protocolResponse.protocol.apr.avg =
                annuals.items.reduce((acc, item) => acc + item.apr, 0) /
                annuals.items.length

            protocolResponse.protocol.apy.avg =
                annuals.items.reduce((acc, item) => acc + item.apy, 0) /
                annuals.items.length
        }

        // STAKE PROTOCOL DATA
        const chain = getChainById(Number(chainId))
        const publicClient = createPublicClient({
            chain,
            transport: http(),
        })

        const multicallData: any = await publicClient.multicall({
            contracts: [
                {
                    address: protocol,
                    abi,
                    functionName: 'getStakingData',
                },
                {
                    address: protocol,
                    abi,
                    functionName: 'getStakingToken',
                },
            ],
        })

        const [{ result: stakingData }, { result: stakingToken }] =
            multicallData

        protocolResponse.protocol.stakedAbs = BigInt(
            stakingData.staked.amount
        ).toString()

        protocolResponse.protocol.stakedRel =
            (Number(stakingData.staked.amount) /
                Number(stakingData.totalSupply)) *
            100

        protocolResponse.protocol.name = `${stakingData.staked.tokenInfo.symbol} staking`
        protocolResponse.protocol.stakes = Number(stakingData.stakes)

        // get logo from ipfs
        const invokeCustomizationResponse = await lambdaClient.send(
            new InvokeCommand({
                FunctionName: process.env.LAMBDA_CUSTOMIZATION_NAME,
                Payload: JSON.stringify({
                    pathParameters: {
                        protocol: `${stakingToken.protocol}`,
                    },
                }),
            })
        )
        const ipfsdata = JSON.parse(
            JSON.parse(
                new TextDecoder().decode(invokeCustomizationResponse.Payload)
            ).body
        )

        //
        // Token Info
        //
        protocolResponse.protocol.logo = ipfsdata.data.logoUrl
        protocolResponse.token.symbol = stakingData.staked.tokenInfo.symbol
        protocolResponse.token.decimals = stakingData.staked.tokenInfo.decimals

        ret.push(protocolResponse)
    }

    return createReturn(200, JSON.stringify(ret), 300) // 5m cache
}
