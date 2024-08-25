import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import { useTheme } from 'next-themes'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
// import { Products } from 'src/components/dapp/Products'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import { chains } from 'shared/supportedChains'
import { DeFiTools } from 'src/components/dapp/DeFiTools'
import { WagmiProvider, createConfig } from 'wagmi'
import { ATM } from '../components/dapp/ATM'
import { Bouncer } from '../components/dapp/Bouncer'
import { Dashboard } from '../components/dapp/Dashboard'
import { Disburser } from '../components/dapp/Disburser'
import { LiquidityBacking } from '../components/dapp/LiquidityBacking'
import { StakeX } from '../components/dapp/StakeX'
import { DappHeader } from '../components/dapp/elements/DappHeader'
import Sidebar from '../components/dapp/elements/Sidebar'
import { DAppContext, DAppContextDataType } from '@dapphelpers/dapp'

TimeAgo.addDefaultLocale(en)

const config = createConfig(
    getDefaultConfig({
        chains: chains as any,
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
        // infuraId: process.env.NEXT_PUBLIC_INFURA_ID!,
        appName: 'DEGENX Ecosystem DAPP',
    })
)

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 86400,
        },
    },
})

export default function Dapp() {
    const { theme } = useTheme()
    const defaultTitle = 'DEGENX Ecosystem'
    const [title, setTitle] = useState<string>(defaultTitle)
    const [data, setData] = useState<DAppContextDataType>({
        ready: false,
        title: '',
    })

    useEffect(() => {
        let _titleUpdate = defaultTitle
        if (title) _titleUpdate += ` - ${title}`
        setData({ ready: true, title: _titleUpdate })
    }, [title])

    if (!data.ready) {
        return null
    }

    return (
        <DAppContext.Provider value={{ data, setData, setTitle }}>
            <BrowserRouter>
                <Head>
                    <title>{data.title}</title>
                    <meta
                        name="description"
                        content="DEGENX is multichain ecosystem that offers a suite of decentralized applications (dApps) and services to provide solutions for projects and individuals in the DeFi space. $DGNX is a multichain token with liquidity backing."
                    />
                </Head>
                <WagmiProvider config={config}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectKitProvider mode={theme as 'light' | 'dark'}>
                            <DappHeader />
                            <div className="dapp my-40 flex sm:my-24 lg:ml-3">
                                <div className="mr-4 hidden w-64 max-w-4xl lg:block">
                                    <Sidebar />
                                </div>
                                <main className="mx-auto w-full sm:w-11/12 lg:w-8/12">
                                    <Routes>
                                        <Route element={<Dashboard />} path="/dapp" />
                                        <Route element={<LiquidityBacking />} path="/dapp/liquidity-backing" />
                                        <Route element={<Disburser />} path="/dapp/disburser" />
                                        <Route element={<ATM />} path="/dapp/atm" />
                                        <Route element={<Bouncer />} path="/dapp/bouncer/:hash" />
                                        <Route
                                            element={<StakeX />}
                                            path="/dapp/staking/:chainId/:protocolAddress"
                                        />{' '}
                                        <Route element={<DeFiTools />} path="/dapp/defitools/*" />
                                    </Routes>
                                </main>
                            </div>
                        </ConnectKitProvider>
                    </QueryClientProvider>
                </WagmiProvider>
            </BrowserRouter>
        </DAppContext.Provider>
    )
}
