import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { RouteObject } from 'react-router-dom'

import BigNumber from 'bignumber.js'
import Image from 'next/image'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import { useAccount, useWalletClient } from 'wagmi'
import {
    getBackingForAddress,
    getBackingPerDGNX,
    getBaseTokenBalance,
    getStats,
    getTotalValue,
} from '../../helpers/liquidityBacking'
import { BNtoNumber } from '../../helpers/number'
import { H2 } from '../H2'
import { BurnForBacking } from './elements/BurnForBacking'
import { Chart } from './elements/Chart'

import imageLiqBack from '../../images/projects/liqback.svg'

const chainId = +process.env.NEXT_PUBLIC_CHAIN_ID
const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC,
    {
        name: process.env.NEXT_PUBLIC_NAME,
        chainId,
    }
)

const WalletBacking = (props: {
    amountBaseTokens: number
    backingValue: number
    wantTokenName?: string
}) => {
    return (
        <>
            <div className="flex">
                <div className="flex-grow">DGNX in wallet</div>
                <div>{props.amountBaseTokens?.toFixed(3) || 0}</div>
            </div>
            <div className="flex">
                <div className="flex-grow">
                    Value in {props.wantTokenName || 0}
                </div>
                <div>{props.backingValue?.toFixed(8) || 0}</div>
            </div>
        </>
    )
}

const tokenIsUSDC = (tokenAddress: string) => {
    return process.env.NEXT_PUBLIC_USDC_ADDRESSES.split(',')
        .map((add) => add.toLowerCase())
        .includes(tokenAddress.toLowerCase())
}

export const LiquidityBacking = (props: RouteObject) => {
    const [stats, setStats] = useState<Awaited<ReturnType<typeof getStats>>>()
    const [totalBacking, setTotalBacking] = useState<number>()
    const [loading, setLoading] = useState(false)
    const [backingPerDGNX, setBackingPerDGNX] = useState<number>()
    const [activeWantToken, setActiveWantToken] = useState<{
        decimals: number
        address: string
        info: { name: string }
    }>()
    const [_forceRefetch, forceRefetch] = useState(Math.random())

    const [baseTokenDecimals, setBaseTokenDecimals] = useState<number>()
    const [baseTokenBalance, setBaseTokenBalance] = useState<BigNumber>()
    const [addressBacking, setAddressBacking] = useState<number>()

    const { address, isConnected } = useAccount()
    const { data: walletClient } = useWalletClient()

    useEffect(() => {
        if (walletClient) {
            getStats(walletClient).then((data) => {
                setStats(data)

                // Try to set USDC.e as default wantToken, if that isn't in the list, just take the first one
                const wantTokenIndex = data.wantTokenData.findIndex((token) =>
                    tokenIsUSDC(token.address)
                )
                setActiveWantToken(
                    data.wantTokenData[
                        wantTokenIndex === -1 ? 0 : wantTokenIndex
                    ]
                )
            })
        }
    }, [walletClient])

    useEffect(() => {
        if (!activeWantToken) {
            return
        }

        setLoading(true)
        setTotalBacking(0)
        setBackingPerDGNX(0)
        setBaseTokenBalance(BigNumber(0))
        setAddressBacking(0)
        Promise.all([
            getTotalValue(activeWantToken.address).then((data) => {
                setTotalBacking(BNtoNumber(data, activeWantToken.decimals))
            }),
            getBackingPerDGNX(activeWantToken.address).then((data) => {
                setBackingPerDGNX(BNtoNumber(data, activeWantToken.decimals))
            }),
        ]).then(() => setLoading(false))
    }, [activeWantToken])

    useEffect(() => {
        if (!isConnected || !address || !activeWantToken?.address) {
            return
        }

        // Your backing
        getBaseTokenBalance(address)
            .then((baseTokens) => {
                setBaseTokenBalance(BigNumber(baseTokens.balance.toString()))
                setBaseTokenDecimals(baseTokens.decimals as number)
                return getBackingForAddress(
                    activeWantToken.address,
                    baseTokens.balance as any
                )
            })
            .then((backing) => {
                setAddressBacking(BNtoNumber(backing, activeWantToken.decimals))
            })
    }, [isConnected, address, activeWantToken, _forceRefetch])

    return (
        <div>
            <div className="flex flex-col items-center sm:mb-8 lg:flex-row">
                <div className="mb-5 flex h-16 w-full items-center justify-center sm:justify-start">
                    <Image
                        alt={`DegenX Liquidity Backing logo`}
                        src={imageLiqBack}
                        height={64}
                        // fill
                    />
                </div>
            </div>
            <div className="mb-8 flex flex-col items-center lg:flex-row">
                <h2 className="text-2xl font-bold text-light-100">
                    Show backing values in
                </h2>
                <div className="mb-2 mt-8 flex flex-row lg:mb-0 lg:mt-0">
                    {stats?.wantTokenData &&
                        stats.wantTokenData.map((token) => (
                            <span
                                key={token.address}
                                className="mx-3 inline-block cursor-pointer rounded-full opacity-70 ring-orange-600 ring-offset-white hover:opacity-100 data-[selected=true]:opacity-100 data-[selected=true]:ring data-[selected=true]:ring-offset-4 dark:ring-light-200 dark:ring-offset-dark"
                                data-selected={
                                    activeWantToken.address === token.address
                                }
                                data-address={token.address}
                                title={token.info[0]}
                                onClick={(e) =>
                                    setActiveWantToken(
                                        stats.wantTokenData.find(
                                            (wantToken) =>
                                                wantToken.address ===
                                                token.address
                                        )
                                    )
                                }
                            >
                                <Image
                                    className="inline-block w-12"
                                    src={`/wanttokens/${chainId}/${token.address}.png`}
                                    alt={token.info[0]}
                                    title={token.info[0]}
                                    width={48}
                                    height={48}
                                />
                            </span>
                        ))}
                </div>
            </div>
            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="rounded-xl border-2 border-degenOrange bg-light-100 p-6 text-light-100 dark:border-activeblue dark:bg-darkerblue">
                    <div className="flex">
                        <H2>Total backing</H2>
                    </div>
                    {!loading && activeWantToken && (
                        <div className="text-right text-2xl text-white">
                            {totalBacking?.toFixed(3) || 0}{' '}
                            {activeWantToken.info[0]}
                        </div>
                    )}
                    {!loading && activeWantToken && (
                        <div className="flex text-white">
                            <div className="flex-grow"></div>
                            <div>
                                {backingPerDGNX?.toFixed(8) || 0}{' '}
                                {activeWantToken.info[0]} / DGNX
                            </div>
                        </div>
                    )}
                </div>
                <div className="rounded-xl border-2 border-degenOrange bg-light-100 p-6 text-light-100 dark:border-activeblue dark:bg-darkerblue">
                    <div className="flex">
                        <H2>Your backing</H2>
                    </div>
                    {isConnected && baseTokenBalance ? (
                        <WalletBacking
                            amountBaseTokens={BNtoNumber(
                                baseTokenBalance,
                                baseTokenDecimals
                            )}
                            backingValue={addressBacking}
                            wantTokenName={activeWantToken?.info![0]}
                        />
                    ) : (
                        <p className="text-center">
                            Connect wallet to see your backing
                        </p>
                    )}
                </div>

                <div className="rounded-xl border-2 border-degenOrange bg-light-100 p-6 text-light-100 dark:border-activeblue dark:bg-darkerblue">
                    <H2>Backing breakdown</H2>
                    <div className="flex flex-col gap-2">
                        {stats?.vaultData ? (
                            stats?.vaultData.map((vaultItem) => {
                                return (
                                    <div
                                        key={vaultItem.tokenAddress}
                                        className="flex"
                                    >
                                        <div className="mr-2 shrink-0 flex-grow-0 self-center">
                                            <Image
                                                className="w-5"
                                                src={`/tokens/${chainId}/${vaultItem.tokenAddress}.png`}
                                                alt={vaultItem.name as string}
                                                title={vaultItem.name as string}
                                                width={20}
                                                height={20}
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            {vaultItem.name as string}
                                        </div>
                                        <div>
                                            {(
                                                Number(vaultItem.balance) /
                                                Number(
                                                    10 **
                                                        (vaultItem.decimals as number)
                                                )
                                            ).toFixed(3)}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <p>...</p>
                        )}
                    </div>
                </div>

                <div className="h-[30em] rounded-xl border-2 border-degenOrange bg-light-100 p-6 text-light-100 dark:border-activeblue dark:bg-darkerblue lg:col-span-2">
                    <Chart wantTokenName={activeWantToken?.info?.name} />
                </div>

                <div className="rounded-xl border-2 border-degenOrange bg-light-100 p-6 text-light-100 dark:border-activeblue dark:bg-darkerblue">
                    <H2>Burn DGNX for backing</H2>
                    <p className="mb-3">How much DGNX do you want to burn?</p>
                    <div className="flex justify-center">
                        <div className="flex-grow">
                            <BurnForBacking
                                baseTokenAmount={baseTokenBalance}
                                baseTokenDecimals={baseTokenDecimals}
                                activeWantToken={activeWantToken}
                                provider={provider}
                                isLoading={loading}
                                forceRefetch={forceRefetch}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}
