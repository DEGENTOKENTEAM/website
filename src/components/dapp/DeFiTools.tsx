import { Link, Route, Routes } from 'react-router-dom'
import { DeFiToolsOverview } from './defitools/Overview'
import {
    DeFiToolsContext,
    DeFiToolsContextDataType,
    DeFiToolsContextType,
} from '@dapphelpers/defitools'
import { useState } from 'react'
import { Overview as DeFiToolsStakeXOverview } from './defitools/stakex/Overview'

export const DeFiTools = () => {
    const [dataDeFiToolsContext, setDataDeFiToolsContext] =
        useState<DeFiToolsContextDataType>({})

    const providerConfig: DeFiToolsContextType = {
        data: dataDeFiToolsContext,
        setData: setDataDeFiToolsContext,
    }

    return (
        <DeFiToolsContext.Provider value={providerConfig}>
            <div>
                <Routes>
                    <Route element={<DeFiToolsOverview />} path="/" />
                    <Route
                        element={<DeFiToolsStakeXOverview />}
                        path="stakex/*"
                    />
                </Routes>
            </div>
        </DeFiToolsContext.Provider>
    )
}
