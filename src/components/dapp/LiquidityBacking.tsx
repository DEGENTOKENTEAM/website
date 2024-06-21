import { useGetBackingFromWantToken } from '@dapphooks/liquidityBacking/useGetBackingForWantToken'
import { useGetBackingPerDGNX } from '@dapphooks/liquidityBacking/useGetBackingPerDGNX'
import { useGetBaseToken } from '@dapphooks/liquidityBacking/useGetBaseToken'
import { useGetStats } from '@dapphooks/liquidityBacking/useGetStats'
import { useGetTotalValue } from '@dapphooks/liquidityBacking/useGetTotalValue'
import { useGetERC20BalanceOf } from '@dapphooks/shared/useGetERC20BalanceOf'
import { useGetERC20Decimals } from '@dapphooks/shared/useGetERC20Decimals'
import { Tile } from '@dappshared/Tile'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { toReadableNumber } from '../../helpers/number'
import imageLiqBack from '../../images/projects/liqback.svg'
import { H2 } from '../H2'
import { BurnForBacking } from './elements/BurnForBacking'
import { Chart } from './elements/Chart'

type WalletBackingProps = {
    baseTokenAmount: bigint
    baseTokenDecimals: bigint
    backingAmount: bigint
    backingDecimals: bigint
    wantTokenName?: string
}

const WalletBacking = ({
    baseTokenAmount,
    baseTokenDecimals,
    backingAmount,
    backingDecimals,
    wantTokenName,
}: WalletBackingProps) => {
    return (
        <>
            <div className="flex">
                <div className="flex-grow">DGNX in wallet</div>
                <div>
                    {toReadableNumber(baseTokenAmount, baseTokenDecimals)}
                </div>
            </div>
            <div className="flex">
                <div className="flex-grow">Value in {wantTokenName || ''}</div>
                <div>{toReadableNumber(backingAmount, backingDecimals)}</div>
            </div>
        </>
    )
}

const tokenIsUSDC = (tokenAddress: string) => {
    return process.env
        .NEXT_PUBLIC_USDC_ADDRESSES!.split(',')
        .map((add) => add.toLowerCase())
        .includes(tokenAddress.toLowerCase())
}

export const LiquidityBacking = () => {
    const chainId = +process.env.NEXT_PUBLIC_CHAIN_ID!
    const { address, isConnected } = useAccount()

    const [isLoading, setIsLoading] = useState(false)
    const [activeWantToken, setActiveWantToken] = useState<{
        decimals: bigint
        address: Address
        info: { name: string }
    }>()
    const [activeWantTokenAddress, setActiveWantTokenAddress] =
        useState<Address>()

    //
    // Hooks
    //
    const { data: dataGetStats, loadData } = useGetStats()
    const {
        data: dataGetTotalValue,
        refetch: refetchGetTotalValue,
        isLoading: isLoadingGetTotalValue,
    } = useGetTotalValue(activeWantToken?.address!)
    const {
        data: dataGetBackingPerDGNX,
        refetch: refetchGetBackingPerDGNX,
        isLoading: isLoadingGetBackingPerDGNX,
    } = useGetBackingPerDGNX(activeWantToken?.address!)
    const { data: dataGetBaseToken } = useGetBaseToken()
    const { data: dataGetERC20BalanceOf } = useGetERC20BalanceOf(
        dataGetBaseToken!,
        address!
    )
    const { data: dataGetERC20Decimals } = useGetERC20Decimals(
        dataGetBaseToken!
    )
    const { data: dataGetBackingFromWantToken } = useGetBackingFromWantToken(
        activeWantToken?.address!,
        dataGetERC20BalanceOf!
    )

    //
    // Handler
    //
    const onSettingsChange = useCallback(() => {
        loadData()
    }, [loadData])

    const onWantTokenChange = (tokenAddress: Address) => {
        setIsLoading(true)
        setActiveWantTokenAddress(tokenAddress)
    }

    //
    // Effects
    //
    useEffect(() => {
        loadData()
    }, [loadData])

    useEffect(() => {
        if (dataGetStats && dataGetStats.wantTokenData) {
            const wantTokenIndex = dataGetStats.wantTokenData.findIndex(
                (token) =>
                    process.env
                        .NEXT_PUBLIC_USDC_ADDRESSES!.split(',')
                        .map((add) => add.toLowerCase())
                        .includes(token.address.toLowerCase())
            )
            setActiveWantToken(
                activeWantTokenAddress
                    ? dataGetStats.wantTokenData.find(
                          (wantToken) =>
                              wantToken.address === activeWantTokenAddress
                      )
                    : dataGetStats.wantTokenData[
                          wantTokenIndex === -1 ? 0 : wantTokenIndex
                      ]
            )
        }
    }, [dataGetStats, activeWantTokenAddress])

    useEffect(() => {
        setIsLoading(isLoadingGetTotalValue || isLoadingGetBackingPerDGNX)
    }, [isLoadingGetTotalValue, isLoadingGetBackingPerDGNX])

    useEffect(() => {
        if (
            refetchGetTotalValue &&
            refetchGetBackingPerDGNX &&
            activeWantToken
        ) {
            refetchGetTotalValue()
            refetchGetBackingPerDGNX()
        }
    }, [refetchGetTotalValue, refetchGetBackingPerDGNX, activeWantToken])

    return (
        <div className="text-dapp-cyan-50">
            <div className="flex flex-col items-center sm:mb-8 lg:flex-row">
                <div className="mb-5 flex h-16 w-full items-center justify-center sm:justify-start">
                    <Image
                        alt={`DEGENX Liquidity Backing logo`}
                        src={imageLiqBack}
                        height={64}
                        // fill
                    />
                </div>
            </div>

            <div className="mb-8 flex flex-col items-center lg:flex-row gap-3">
                <h2 className="text-2xl font-bold">Show backing values in</h2>
                <div className="mb-2 mt-8 flex flex-row lg:mb-0 lg:mt-0">
                    {dataGetStats?.wantTokenData &&
                        dataGetStats.wantTokenData.map((token) => (
                            <span
                                key={token.address}
                                className="mx-3 inline-block cursor-pointer rounded-full opacity-70 ring-orange-600 ring-offset-white hover:opacity-100 data-[selected=true]:opacity-100 data-[selected=true]:ring data-[selected=true]:ring-offset-4 dark:ring-light-200 dark:ring-offset-dark"
                                data-selected={
                                    activeWantToken?.address === token.address
                                }
                                data-address={token.address}
                                title={token.info.name}
                                onClick={() => onWantTokenChange(token.address)}
                            >
                                <Image
                                    className="inline-block w-12"
                                    src={`/wanttokens/${chainId}/${token.address}.png`}
                                    alt={token.info.name}
                                    title={token.info.name}
                                    width={48}
                                    height={48}
                                />
                            </span>
                        ))}
                </div>
            </div>
            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                <Tile>
                    <div className="flex">
                        <H2>Total backing</H2>
                    </div>
                    {!isLoadingGetTotalValue &&
                        !isLoadingGetBackingPerDGNX &&
                        activeWantToken && (
                            <>
                                <div className="text-right text-2xl">
                                    {toReadableNumber(
                                        dataGetTotalValue,
                                        activeWantToken?.decimals
                                    )}{' '}
                                    {activeWantToken.info.name}
                                </div>
                                <div className="flex">
                                    <div className="flex-grow"></div>
                                    <div>
                                        {toReadableNumber(
                                            dataGetBackingPerDGNX,
                                            activeWantToken?.decimals
                                        )}{' '}
                                        {activeWantToken.info.name} / DGNX
                                    </div>
                                </div>
                            </>
                        )}
                </Tile>
                <Tile>
                    <div className="flex">
                        <H2>Your backing</H2>
                    </div>
                    {isConnected &&
                    dataGetERC20BalanceOf &&
                    dataGetERC20Decimals &&
                    dataGetBackingFromWantToken &&
                    activeWantToken ? (
                        <WalletBacking
                            baseTokenAmount={dataGetERC20BalanceOf}
                            baseTokenDecimals={dataGetERC20Decimals}
                            backingAmount={dataGetBackingFromWantToken}
                            backingDecimals={activeWantToken.decimals}
                            wantTokenName={activeWantToken.info?.name}
                        />
                    ) : (
                        <p className="text-center">
                            Connect wallet to see your backing
                        </p>
                    )}
                </Tile>

                <Tile>
                    <H2>Backing breakdown</H2>
                    <div className="flex flex-col gap-2">
                        {dataGetStats?.vaultData ? (
                            dataGetStats?.vaultData.map((vaultItem) => {
                                return (
                                    <div
                                        key={vaultItem.tokenAddress}
                                        className="flex"
                                    >
                                        <div className="mr-2 shrink-0 flex-grow-0 self-center">
                                            <Image
                                                className="w-5"
                                                src={`/tokens/${chainId}/${vaultItem.tokenAddress}.png`}
                                                alt={vaultItem.name}
                                                title={vaultItem.name}
                                                width={20}
                                                height={20}
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            {vaultItem.name}
                                        </div>
                                        <div>
                                            {toReadableNumber(
                                                vaultItem.balance,
                                                vaultItem.decimals
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <p>...</p>
                        )}
                    </div>
                </Tile>

                <Tile className="h-[30em] lg:col-span-2">
                    <Chart wantTokenName={activeWantToken?.info?.name!} />
                </Tile>

                <Tile>
                    <H2>Burn DGNX for backing</H2>
                    <p className="mb-3">How much DGNX do you want to burn?</p>
                    <div className="flex justify-center">
                        <div className="flex-grow">
                            <BurnForBacking
                                baseTokenAmount={dataGetERC20BalanceOf!}
                                baseTokenAddress={dataGetBaseToken!}
                                baseTokenDecimals={dataGetERC20Decimals!}
                                baseTokenSymbol={'DGNX'}
                                activeWantToken={activeWantToken!}
                                onSettingsChange={onSettingsChange}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </Tile>
            </div>
            <ToastContainer />
        </div>
    )
}
