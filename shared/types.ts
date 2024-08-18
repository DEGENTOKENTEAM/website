export type ProtocolsResponse = {
    protocol: {
        name: string
        logo: string
        stakedRel: number
        stakedAbs: string // is converted bigint as string
        stakers: number
        stakes: number
        apr: {
            low: number
            avg: number
            high: number
        }
        apy: {
            low: number
            avg: number
            high: number
        }
        source: string
        chainId: number
    }
    token: {
        symbol: string
        decimals: number
    }
}
