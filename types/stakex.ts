import { Address } from 'viem'

export type StakeXAPIPeripheryResponseType = {
    data: {
        projectName: string | null
        heroBannerUrl: string | null
        projectLogoUrl: string | null
        pending: boolean
    }
}

export type StakeXAPIPeripheryUpdateDTO = {
    protocol: Address
    chainId: number
    data: any // TODO maybe type this
    challenge: string
    sig: Address
}
