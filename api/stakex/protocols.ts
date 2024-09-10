import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { cloneDeep, isNumber } from 'lodash'
import { createPublicClient, http, zeroAddress } from 'viem'
import { getChainById } from '../../shared/supportedChains'
import { ProtocolsResponse } from '../../shared/types'
import { createReturn } from '../helpers/return'
import { fetchIpfsData } from '../ipfs/stakex/customization/fetch'
import { StakeXAnnualsRepository } from '../services/annuals'
import { StakeXProtocolsRepository } from '../services/protocols'
import abi from './../../src/abi/stakex/abi-ui.json'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const start = Date.now()
    console.log({ start })
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
            isRunning: false,
        },
        token: { decimals: 0, symbol: '' },
    }

    const annualsRepository = new StakeXAnnualsRepository()
    const protocolsRepository = new StakeXProtocolsRepository()

    const protocols =
        isNumber(chainId) && chainId > 0
            ? await protocolsRepository.getAllByChainId(chainId, 100) // show first 100 entries
            : await protocolsRepository.getAll(100) // show first 100 entries

    if (!protocols.count) return createReturn(200, JSON.stringify({}))

    const chainIdAndContracts: { [key: number]: any[] } = {}
    for (const item of protocols.items) {
        const { protocol, chainId } = item
        if (!chainIdAndContracts[chainId]) chainIdAndContracts[chainId] = []
        chainIdAndContracts[chainId].push(
            ...[
                {
                    address: protocol,
                    abi,
                    functionName: 'getStakingData',
                },
                {
                    address: protocol,
                    abi,
                    functionName: 'isRunning',
                },
            ]
        )
    }

    const dataToChainAndProtocol: {
        [key: number]: any[]
    } = {}
    for (const chainId of Object.keys(chainIdAndContracts)) {
        const chain = getChainById(Number(chainId))
        const publicClient = createPublicClient({
            chain,
            transport: http(),
        })
        dataToChainAndProtocol[Number(chainId)] = await publicClient.multicall({
            contracts: [...chainIdAndContracts[chain.id]],
        })
    }

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

            if (protocolResponse.protocol.apy.high == Number.MIN_VALUE)
                protocolResponse.protocol.apy.high = 0
            if (protocolResponse.protocol.apy.low == Number.MAX_VALUE)
                protocolResponse.protocol.apy.high = 0

            if (protocolResponse.protocol.apr.high == Number.MIN_VALUE)
                protocolResponse.protocol.apr.high = 0
            if (protocolResponse.protocol.apr.low == Number.MAX_VALUE)
                protocolResponse.protocol.apr.high = 0
        }

        const [{ result: stakingData }, { result: isRunning }] =
            dataToChainAndProtocol[Number(chainId)].splice(0, 2)

        protocolResponse.protocol.isRunning = isRunning
        protocolResponse.protocol.stakedAbs = BigInt(
            stakingData.staked.amount
        ).toString()

        protocolResponse.protocol.stakedRel =
            (Number(stakingData.staked.amount) /
                Number(stakingData.totalSupply)) *
            100

        protocolResponse.protocol.name = `${stakingData.staked.tokenInfo.symbol} staking`
        protocolResponse.protocol.stakes = Number(stakingData.stakes)

        const ipfsdata: any = await fetchIpfsData(`${protocol}`, chainId, {
            source: stakingData.staked.tokenInfo.source,
            symbol: stakingData.staked.tokenInfo.symbol,
        })
        protocolResponse.protocol.logo = ipfsdata.data.logoUrl

        //
        // Token Info
        //
        protocolResponse.token.symbol = stakingData.staked.tokenInfo.symbol
        protocolResponse.token.decimals = stakingData.staked.tokenInfo.decimals

        ret.push(protocolResponse)
    }
    const finish = Date.now()
    console.log({ finish, delta: (finish - start) / 1000 })

    return createReturn(200, JSON.stringify(ret), 60) // 5m cache
}
