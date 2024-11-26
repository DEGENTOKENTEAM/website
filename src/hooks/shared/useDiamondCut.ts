import abi from '@dappabis/stakex/abi-ui.json'
import { Address, zeroAddress, zeroHash } from 'viem'
import { useExecuteFunction } from './useExecuteFunction'

export enum FacetCutAction {
    Add,
    Replace,
    Remove,
}

export type FacetCut = {
    facetAddress: Address
    action: FacetCutAction
    functionSelectors: string[]
}

export const useDiamondCut = (
    chainId: number,
    address: Address,
    cuts: FacetCut[],
    initAddress?: Address,
    initCalldata?: string
) =>
    useExecuteFunction({
        abi,
        address,
        chainId,
        args: [cuts, initAddress || zeroAddress, initCalldata || zeroHash],
        eventNames: ['DiamondCut'],
        functionName: 'diamondCut',
        enabled: Boolean(cuts && cuts.length),
    })
