import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { cloneDeep, isNumber, pick, toLower } from 'lodash'
import { Address, createPublicClient, http, isAddress, zeroAddress } from 'viem'
import { getChainById } from '../../shared/supportedChains'
import { ProtocolsResponse } from '../../shared/types'
import { createReturn } from '../helpers/return'
import { StakeXAnnualsRepository } from '../services/annuals'
import { StakeXProtocolsRepository } from '../services/protocols'
import abi from './../../src/abi/stakex/abi-ui.json'
import { fetchIpfsData } from './periphery/get'
import { TokenInfoResponse } from '../../src/types'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { chainId: _chainIdOrig, account: _account } =
        event.pathParameters || {}

    const chainId = Number(_chainIdOrig)
    const account =
        _account && isAddress(_account) ? (toLower(_account) as Address) : null

    const protocolResponseBlank: ProtocolsResponse = {
        protocol: {
            apr: 0,
            apy: 0,
            logo: '',
            name: '',
            stakedAbs: '',
            stakedRel: 0,
            stakers: 0,
            stakes: 0,
            source: zeroAddress,
            chainId: 0,
            isRunning: false,
            rewards: [],
        },
        token: { decimals: 0, symbol: '' },
    }

    const annualsRepository = new StakeXAnnualsRepository()
    const protocolsRepository = new StakeXProtocolsRepository()

    const protocols = account
        ? await protocolsRepository.getAllRegularsByOwnerAddress(account)
        : isNumber(chainId) && chainId > 0
        ? await protocolsRepository.getAllRegularsByChainId(chainId, 100)
        : await protocolsRepository.getAllRegulars(100)

    if (!protocols.count) return createReturn(200, JSON.stringify([]))

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
                    functionName: 'getTokens',
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
            transport: http(undefined, {
                fetchOptions: {
                    headers: {
                        'Origin': 'https://dgnx.finance',
                    },
                },
            }),
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
        if (blockNumberAPUpdate) {
            const annuals = await annualsRepository.getLatestByBlockNumber(
                chainId,
                protocol,
                blockNumberAPUpdate
            )

            if (annuals.count) {
                for (const annual of annuals.items) {
                    if (protocolResponse.protocol.apr < annual.apr)
                        protocolResponse.protocol.apr = annual.apr
                    if (protocolResponse.protocol.apy < annual.apr)
                        protocolResponse.protocol.apy = annual.apy
                }
            }
        }

        const [
            { result: stakingData },
            { result: tokens },
            { result: isRunning },
        ] = dataToChainAndProtocol[Number(chainId)].splice(0, 3)

        if (stakingData) {
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
            protocolResponse.protocol.logo = ipfsdata.data.projectLogoUrl

            //
            // Token Info
            //
            protocolResponse.token.symbol = stakingData.staked.tokenInfo.symbol
            protocolResponse.token.decimals =
                stakingData.staked.tokenInfo.decimals
        }

        if (tokens) {
            protocolResponse.protocol.rewards.push(
                ...tokens.filter((token: TokenInfoResponse) => token.isReward)
            )
        }

        ret.push(protocolResponse)
    }

    return createReturn(
        200,
        JSON.stringify(ret, (_, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ),
        60
    ) // 1m cache
}
