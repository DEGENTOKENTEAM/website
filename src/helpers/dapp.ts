import { createContext } from 'react'

export type DAppContextDataType = {
    title: string
    ready: boolean
}

export type DAppContextType = {
    setData: Function
    setTitle: Function
    data: DAppContextDataType
}

export const DAppContext = createContext<DAppContextType>({
    setData: () => {},
    setTitle: () => {},
    data: {
        title: '',
        ready: false,
    },
})
