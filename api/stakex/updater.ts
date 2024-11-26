import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { get, toLower } from 'lodash'
import {
    Address,
    createPublicClient,
    encodeFunctionData,
    http,
    zeroAddress,
    zeroHash,
} from 'viem'
import { createReturn } from '../helpers/return'
import protocols from './../../config/protocols'
import { getChainById } from './../../shared/supportedChains'

enum FacetCutAction {
    Add,
    Replace,
    Remove,
}

const abi = [
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'facetAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'enum IDiamondCut.FacetCutAction',
                        name: 'action',
                        type: 'uint8',
                    },
                    {
                        internalType: 'bytes4[]',
                        name: 'functionSelectors',
                        type: 'bytes4[]',
                    },
                ],
                internalType: 'struct IDiamondCut.FacetCut[]',
                name: '_diamondCut',
                type: 'tuple[]',
            },
            {
                internalType: 'address',
                name: '_init',
                type: 'address',
            },
            {
                internalType: 'bytes',
                name: '_calldata',
                type: 'bytes',
            },
        ],
        name: 'diamondCut',
        outputs: [],
        stateMutability: 'nonpayable',
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
    const protocol: Address = get(
        event,
        ['queryStringParameters', 'protocol'],
        ''
    )
    const chainId: number = get(event, ['queryStringParameters', 'chainId'], 0)

    const client = createPublicClient({
        chain: getChainById(chainId),
        transport: http(),
    })

    // genesis facets
    let facetsGenesis: any[] = []
    try {
        facetsGenesis = (await client.readContract({
            abi,
            address: protocols[chainId].stakex.genesis,
            functionName: 'facets',
        })) as any[]
    } catch (e) {
        return createReturn(404, 'GENESIS_NOT_FOUND')
    }

    // target facets
    let facetsTarget: any[] = []
    try {
        facetsTarget = (await client.readContract({
            abi,
            address: protocol,
            functionName: 'facets',
        })) as any[]
    } catch (e) {
        return createReturn(404, 'TARGET_NOT_FOUND')
    }

    const selectorToFacetGenesis: { [selector: string]: string } = {}
    for (const facet of facetsGenesis) {
        for (const selector of facet.functionSelectors) {
            selectorToFacetGenesis[selector] = facet.facetAddress
        }
    }

    const addSelectors = []
    const updateSelectors = []
    const removeSelectors = []

    const selectorToFacetTarget: { [selector: string]: string } = {}
    for (const facet of facetsTarget) {
        for (const selector of facet.functionSelectors) {
            selectorToFacetTarget[selector] = facet.facetAddress

            // check if the selector of the target is in the selector list of the genesis
            if (!selectorToFacetGenesis[selector]) {
                // if not, remove it from the target
                removeSelectors.push(selector)
            }
        }
    }

    // go through all selectors of genesis
    for (const selector of Object.keys(selectorToFacetGenesis)) {
        // when the selector of the genesis is already on the target
        if (selectorToFacetTarget[selector]) {
            // check whether the target and genesis facet differs
            if (
                selectorToFacetTarget[selector] !=
                selectorToFacetGenesis[selector]
            ) {
                // if it differs, needs an update
                updateSelectors.push(selector)
            }
        } else {
            // if it is not existing on the target, it has to be added
            addSelectors.push(selector)
        }
    }

    const addOrUpdateFacets: {
        action: FacetCutAction
        facetAddress: string
        functionSelectors: string[]
    }[] = []

    for (const addSelector of addSelectors) {
        const facet = addOrUpdateFacets.find(
            (f) =>
                toLower(f.facetAddress) ==
                    toLower(selectorToFacetGenesis[addSelector]) &&
                f.action == FacetCutAction.Add
        )
        // if the facet is currently not existing on the data
        if (!facet) {
            // add it in total as an add operation, since it's a new selection
            addOrUpdateFacets.push({
                action: FacetCutAction.Add,
                facetAddress: selectorToFacetGenesis[addSelector],
                functionSelectors: [addSelector],
            })
        } else facet.functionSelectors.push(addSelector) // otehrwise just add the selector
    }

    // console.log(JSON.stringify(addOrUpdateFacets, undefined, 2));

    for (const updateSelector of updateSelectors) {
        const facet = addOrUpdateFacets.find(
            (f) =>
                toLower(f.facetAddress) ==
                    toLower(selectorToFacetGenesis[updateSelector]) &&
                f.action == FacetCutAction.Replace
        )
        if (!facet) {
            addOrUpdateFacets.push({
                action: FacetCutAction.Replace,
                facetAddress: selectorToFacetGenesis[updateSelector],
                functionSelectors: [updateSelector],
            })
        } else facet.functionSelectors.push(updateSelector)
    }

    removeSelectors.push(...['0x313b31b9', '0xf8c7838f', '0xd2cc86ce'])

    const removeFacets = [
        removeSelectors.reduce(
            (acc, selector) => {
                acc.functionSelectors.push(selector)
                return acc
            },
            {
                action: FacetCutAction.Remove,
                facetAddress: zeroAddress,
                functionSelectors: [],
            } as {
                action: FacetCutAction
                facetAddress: string
                functionSelectors: string[]
            }
        ),
    ]

    const updateCalldata = encodeFunctionData({
        abi,
        functionName: 'diamondCut',
        args: [
            addOrUpdateFacets,
            protocols[chainId].stakex.init_v_1_3_0,
            '0xe1c7392a', // init() function selector
        ],
    })

    const cleanupCalldata = encodeFunctionData({
        abi,
        functionName: 'diamondCut',
        args: [removeFacets, zeroAddress, zeroHash],
    })

    return createReturn(
        200,
        JSON.stringify({
            protocol,
            chainId,
            upgradeData: {
                updateCalldata,
                cleanupCalldata,
            },
        })
    )
}
