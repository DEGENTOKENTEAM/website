import { Address } from 'viem'

export type StakeXCustomizationResponseType = {
    data: {
        projectName: string
        logoUrl: string
        logoUrlUpdatePending: boolean
        stylesUrl: string
        stylesUrlUpdatePending: boolean
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
