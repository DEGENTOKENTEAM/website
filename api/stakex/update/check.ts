import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Address, createPublicClient, http, zeroAddress } from 'viem'
import protocols from '../../../config/protocols'
import { getChainById } from '../../../shared/supportedChains'
import { createReturn } from '../../helpers/return'

const abi = [
    {
        inputs: [
            {
                internalType: 'bytes4',
                name: '_functionSelector',
                type: 'bytes4',
            },
        ],
        name: 'facetAddress',
        outputs: [
            {
                internalType: 'address',
                name: 'facetAddress_',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'facets',
        outputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'facetAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'bytes4[]',
                        name: 'functionSelectors',
                        type: 'bytes4[]',
                    },
                ],
                internalType: 'struct IDiamondLoupe.Facet[]',
                name: 'facets_',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
]

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { chainId: _chainId, protocol } = event.pathParameters || {}
    const chainId = Number(_chainId)

    if (!protocol)
        return createReturn(
            404,
            JSON.stringify({ message: 'PROTOCOL_NOT_SUPPORTED' })
        )

    if (!protocols[chainId])
        return createReturn(
            404,
            JSON.stringify({ message: 'CHAIN_NOT_SUPPORTED' })
        )

    const chain = getChainById(chainId)
    const publicClient = createPublicClient({
        chain,
        transport: http(),
    })

    const facetsChild = (await publicClient.readContract({
        abi,
        address: protocol as Address,
        functionName: 'facets',
    })) as unknown as any[]

    const facetsGenesis = (await publicClient.readContract({
        abi,
        address: protocols[chainId].stakex.genesis,
        functionName: 'facets',
    })) as unknown as any[]

    const selectorsGenesis: string[] = facetsGenesis.reduce(
        (acc, facet) => [
            ...(acc || []),
            ...(facet.functionSelectors && facet.functionSelectors.length > 0
                ? facet.functionSelectors
                : []),
        ],
        []
    )

    const selectorsChild: string[] = facetsChild.reduce(
        (acc, facet) => [
            ...(acc || []),
            ...(facet.functionSelectors && facet.functionSelectors.length > 0
                ? facet.functionSelectors
                : []),
        ],
        []
    )

    const selectorsChildRemove = selectorsChild.filter(
        (selector) => !selectorsGenesis.includes(selector)
    )

    const facetToAddOrUpdate: any[] = facetsGenesis.filter(
        (facet) =>
            !Boolean(
                facetsChild.find((f) => f.facetAddress === facet.facetAddress)
            )
    )

    const cuts: {
        facetAddress: string
        action: number // 0 = add, 1 = replace, 2 = remove
        functionSelectors: string[]
    }[] = []

    for (const facet of facetToAddOrUpdate) {
        const addSelectors = []
        const replaceSelectors = []

        for (const selector of facet.functionSelectors) {
            const currentFacetAddress = (await publicClient.readContract({
                abi,
                address: protocol as Address,
                functionName: 'facetAddress',
                args: [selector],
            })) as unknown as string

            if (currentFacetAddress === zeroAddress) {
                addSelectors.push(selector)
                continue
            }

            if (currentFacetAddress.toLowerCase() !== zeroAddress.toLowerCase())
                replaceSelectors.push(selector)
        }

        if (replaceSelectors.length) {
            cuts.push({
                facetAddress: facet.facetAddress,
                action: 1,
                functionSelectors: replaceSelectors,
            })
        }

        if (addSelectors.length) {
            cuts.push({
                facetAddress: facet.facetAddress,
                action: 0,
                functionSelectors: addSelectors,
            })
        }
    }

    if (selectorsChildRemove.length) {
        cuts.push({
            facetAddress: zeroAddress,
            action: 2,
            functionSelectors: selectorsChildRemove,
        })
    }

    return createReturn(200, JSON.stringify({ updates: cuts }))
}
