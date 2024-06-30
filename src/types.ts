import { Address } from 'viem'

export enum BACKING_TYPE {
    TOTAL = 'TOTAL',
    ONE = 'ONE',
}

export enum CHART_PRICE_MODE {
    USD = 'USD',
    AVAX = 'AVAX',
}

export type AtmStatsLoading = {
    loading: 'yes'
}

// STAKING
export type TokenInfoResponse = {
    isReward: boolean
    isTarget: boolean
    isRewardActive: boolean
    isTargetActive: boolean
    decimals: bigint
    source: Address
    injected: bigint
    rewarded: bigint
    name: string
    symbol: string
}

export type StakingBaseProps = {
    protocolAddress: Address
    stakingTokenInfo: TokenInfoResponse
}

export type TokenInfo = {
    name: string
    symbol: string
    decimals: bigint
    source: Address
}

export type StakeResponse = {
    burned: boolean
    bucketId: string
    lock: bigint
    locked: boolean
    lockStart: bigint
    release: bigint
    tokenId: bigint
    amount: bigint
}

export type StakeBucketDataResponse = {
    active: boolean
    burn: boolean
    id: Address
    share: bigint
    lock: bigint
    staked: bigint
}

export type StakeBucket = {
    id: Address
    duration: number
    burn: boolean
    active: boolean
    multiplier: number
    share: number
    staked: bigint
}

export type RewardEstimation = {
    tokenInfo: TokenInfo
    amount: bigint
}

export type TokenURI = {
    name: string
    description: string
    image: string
}
