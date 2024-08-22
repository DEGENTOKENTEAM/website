import { Address } from 'viem'

export type StakeXCustomizationResponseType = {
    data: {
        projectName: string | null
        logoUrl: string | null
        logoUrlUpdatePending: boolean
        stylesUrl: string | null
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
