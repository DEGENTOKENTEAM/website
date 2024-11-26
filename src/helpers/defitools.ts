import { StakingMetrics, TokenInfoResponse } from '@dapptypes'
import { createContext } from 'react'
import { Address, zeroAddress } from 'viem'
import { Chain } from 'viem/chains'

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
    isActive: boolean
    isRunning: boolean
    isCampaign: boolean
    canEdit: boolean
    chain?: Chain
    tokens: TokenInfoResponse[]
    stakingToken?: TokenInfoResponse
    metrics?: StakingMetrics
}

export type ManageStakeXContextType = {
    setData: Function
    data: ManageStakeXContextDataType
    reloadData: Function
}

export const ManageStakeXContextInitialData: ManageStakeXContextDataType = {
    protocol: zeroAddress,
    owner: zeroAddress,
    tokens: [],
    isOwner: false,
    isActive: false,
    isRunning: false,
    isCampaign: false,
    isLoading: true,
    canEdit: false,
}

export const ManageStakeXContext = createContext<ManageStakeXContextType>({
    setData: () => {},
    reloadData: () => {},
    data: {
        ...ManageStakeXContextInitialData,
    },
})
