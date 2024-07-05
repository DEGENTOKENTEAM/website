import { StakingMetrics, TokenInfoResponse } from '@dapptypes'
import { Chain } from '@wagmi/chains'
import { createContext } from 'react'
import { Address, zeroAddress } from 'viem'

export type DeFiToolsContextDataType = {
    // ... define data tha is needed
}

export type DeFiToolsContextType = {
    // ... maybe add some local storage handler, to continue deploying
    setData: Function
    data: DeFiToolsContextDataType
}

export const DeFiToolsContext = createContext<DeFiToolsContextType>({
    setData: () => {},
    data: {},
})

//
// Manage StakeX Context
//
export type ManageStakeXContextDataType = {
    protocol: Address
    owner: Address
    isLoading: boolean
    isOwner: boolean
    chain?: Chain
    stakingToken?: TokenInfoResponse
    metrics?: StakingMetrics
}

export type ManageStakeXContextType = {
    setData: Function
    data: ManageStakeXContextDataType
}

export const ManageStakeXContext = createContext<ManageStakeXContextType>({
    setData: () => {},
    data: {
        protocol: zeroAddress,
        owner: zeroAddress,
        isOwner: false,
        isLoading: true,
    },
})
