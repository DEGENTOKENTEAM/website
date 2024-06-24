import { createContext } from 'react'

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
