import { createContext } from 'react'

export type NavigationConfig = {
    defitools: {
        staking: {
            myCampaigns: {
                enabled: boolean
            }
            myFlexibles: {
                enabled: boolean
            }
        }
    }
}

export type DAppContextDataType = {
    title: string
    navigation: NavigationConfig
    ready: boolean
}

export type DAppContextType = {
    setData: Function
    setTitle: Function
    data: Partial<DAppContextDataType>
}

export const DAppContext = createContext<DAppContextType>({
    setData: () => {},
    setTitle: () => {},
    data: {
        title: '',
        ready: false,
        navigation: {
            defitools: {
                staking: {
                    myCampaigns: { enabled: false },
                    myFlexibles: { enabled: false },
                },
            },
        },
    },
})
