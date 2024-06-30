import { Address } from 'viem'

export type StakeXCustomizationResponseType = {
    data: {
        logoUrl: string
        stylesUrl: string
    }
}

export type StakeXCustomizationDTO = {
    protocol: Address
    chainId: number
    image: string
    styles: object | []
    challenge: string
    sig: string
}
