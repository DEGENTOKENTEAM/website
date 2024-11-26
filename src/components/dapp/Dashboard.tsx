import { DGNX_ADDRESS } from '@dappconstants'
import { toReadableNumber } from '@dapphelpers/number'
import { useGetERC20BalanceOf } from '@dapphooks/shared/useGetERC20BalanceOf'
import { useGetERC20TotalSupply } from '@dapphooks/shared/useGetERC20TotalSupply'
import { CaretDivider } from '@dappshared/CaretDivider'
import { Tile } from '@dappshared/Tile'
import BigNumber from 'bignumber.js'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { HiOutlineExternalLink } from 'react-icons/hi'
import { RouteObject } from 'react-router-dom'
import { H2 } from '../H2'
import { Chart } from './elements/Chart'

const numberFormatter2 = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const showAmount = (walletData: any, tokenAddresses: string[]) => {
    let totalBalance = 0

    tokenAddresses.forEach((tokenAddress) => {
        const token = walletData.find((item) => item.tokenAddress === tokenAddress)
        if (!token) return 0

        let balance = parseInt(token.balance)
        if (tokenAddress === '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7') {
            balance += parseInt(walletData.find((item: any) => !item.tokenAddress)?.balance)
        }

        totalBalance += balance / 10 ** token.token.decimals
    })

    return numberFormatter2.format(totalBalance)
}

const showFiatAmount = (walletData: any, tokenAddresses: string[], returnRaw: boolean = false) => {
    let totalBalance = 0
    tokenAddresses.forEach((tokenAddress) => {
        const token = walletData.find((item) => item.tokenAddress === tokenAddress)
        if (!token) return 0

        let fiatBalance = parseInt(token.fiatBalance)
        if (tokenAddress === '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7') {
            fiatBalance += parseInt(walletData.find((item) => !item.tokenAddress)?.fiatBalance)
        }

        totalBalance += fiatBalance
    })

    if (returnRaw) {
        return totalBalance
    }

    return numberFormatter2.format(totalBalance)
}

let addressDataCache = {}

const getAddressData = async (address: string, retryNum: number = 0) => {
    try {
        if (addressDataCache[address]) return addressDataCache[address]

        const dataRaw = await fetch(
            `https://safe-transaction-avalanche.safe.global/api/v2/safes/${address}/balances/?trusted=true&exclude_spam=true`
            // `https://safe-transaction-avalanche.safe.global/api/v1/safes/${address}/balances/usd/?trusted=false&exclude_spam=true`
        )
        const data = await dataRaw.json()
        addressDataCache[address] = data.results
        return addressDataCache[address]
    } catch (e) {
        if (retryNum < 3) {
            return getAddressData(address, retryNum + 1)
        }
    }
}

const WalletInfo = (props: any) => {
    const [walletData, setWalletData] = useState<any>()

    useEffect(() => {
        getAddressData(props.address).then(setWalletData)
    }, [props.address])
    return (
        <>
            <H2>
                {props.name}{' '}
                <a rel="noreferrer" href={`https://avascan.info/blockchain/c/address/${props.address}`} target="_blank">
                    <HiOutlineExternalLink className="inline text-light-600" />
                </a>
            </H2>
            {walletData ? (
                <div className="grid grid-cols-3">
                    <div />
                    <div className="font-bold text-dark dark:text-light-100">Quantity</div>
                    <div className="font-bold text-dark dark:text-light-100">USD value</div>
                    <div>DGNX</div>
                    <div className="col-span-2">
                        {showAmount(walletData, ['0x51e48670098173025C477D9AA3f0efF7BF9f7812'])}
                    </div>
                    <div>AVAX</div>
                    <div>{showAmount(walletData, ['0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'])}</div>
                    <div>${showFiatAmount(walletData, ['0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'])}</div>
                    <div className="grow">BTC</div>
                    <div className="col-span-2">
                        {showAmount(walletData, ['0x152b9d0FdC40C096757F570A51E494bd4b943E50'])}{' '}
                    </div>
                    <div className="grow">Stablecoins</div>
                    <div>
                        $
                        {showAmount(walletData, [
                            '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
                            '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
                        ])}
                    </div>
                    <div>
                        $
                        {showAmount(walletData, [
                            '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
                            '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
                        ])}
                    </div>
                </div>
            ) : (
                '...'
            )}
        </>
    )
}

const PriceChange = (props: { item: number }) => {
    return (
        <p className={clsx(props.item > 0 ? 'text-green-600' : 'text-red-600')}>
            {props.item > 0 ? '↑' : '↓'}
            {props.item}%
        </p>
    )
}

const TxnsCount = (props: { item: { buys: number; sells: number } }) => {
    if (!props.item) return null
    return (
        <p className={clsx(props.item.buys >= props.item.sells ? 'text-green-600' : 'text-red-600')}>
            {props.item.buys >= props.item.sells ? '↑' : '↓'}
            {props.item.buys}/{props.item.sells}
        </p>
    )
}

const getBackingAmount = async () => {
    const to = Math.floor(new Date().getTime() / 1000)
    const resultRaw = await fetch(
        `${process.env.NEXT_PUBLIC_BACKING_API_ENDPOINT}/getData/avalanche/${process.env.NEXT_PUBLIC_TOKEN_ADDRESS}/${to}/M/1`
    )
    const result = await resultRaw.json()
    const backingUsd = result.bars?.[0].wantTokens.find((wantToken) => wantToken.name.toLowerCase().includes('usd'))
    return new BigNumber(backingUsd.bOne).div(new BigNumber(10).pow(backingUsd.dec)).toNumber()
}

export const Dashboard = (props: RouteObject) => {
    const DGNX_INITIAL_SUPPLY = 21n * 10n ** 24n
    const chainId = +process.env.NEXT_PUBLIC_CHAIN_ID!
    const [dexData, setDexData] = useState<any>()

    const [burnAmount, setBurnAmount] = useState<number>()
    const [lockerAmount, setLockerAmount] = useState<number>()
    const [backingAmountUsd, setBackingAmountUsd] = useState<number>()

    const { data: balanceOfDeadAddress } = useGetERC20BalanceOf(
        DGNX_ADDRESS,
        '0x000000000000000000000000000000000000dead',
        chainId
    )
    const { data: balanceOfLocker } = useGetERC20BalanceOf(
        DGNX_ADDRESS,
        '0x2c7d8bb6aba4fff56cddbf9ea47ed270a10098f7',
        chainId
    )
    const { data: dataTotalSupply } = useGetERC20TotalSupply(DGNX_ADDRESS, chainId)

    useEffect(() => {
        balanceOfLocker && setLockerAmount(Number(balanceOfLocker / 10n ** 18n))
    }, [balanceOfLocker])

    useEffect(() => {
        if (dataTotalSupply && balanceOfDeadAddress)
            setBurnAmount(Number((DGNX_INITIAL_SUPPLY - dataTotalSupply + balanceOfDeadAddress) / 10n ** 18n))
    }, [balanceOfDeadAddress, dataTotalSupply, DGNX_INITIAL_SUPPLY])

    useEffect(() => {
        fetch(
            `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/latest/dex/tokens/0x51e48670098173025C477D9AA3f0efF7BF9f7812`
        )
            .then((res) => res.json())
            .then((data) =>
                setDexData({
                    traderJoe: (data.pairs || []).find((pair: any) => pair.dexId === 'traderjoe'),
                    pangolin: (data.pairs || []).find((pair: any) => pair.dexId === 'pangolin'),
                })
            )

        getBackingAmount().then(setBackingAmountUsd)
    }, [])

    return (
        <div>
            <h1 className="mb-5 mt-4 flex flex-col gap-1 px-8 font-title text-3xl font-bold tracking-wide sm:mb-8 sm:flex-row sm:px-0">
                <span className="text-techGreen">DEGENX</span>
                <span className="text-degenOrange">DASHBOARD</span>
            </h1>
            <div className="mb-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
                <Tile className="col-span-2 flex flex-col gap-4">
                    <div className="text-2xl font-bold text-dark dark:text-dapp-cyan-50">Exchange Information</div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg bg-dapp-blue-800 p-4">
                            <div className="grid grid-cols-3">
                                <div className="col-span-3 font-bold">TraderJoe</div>
                                <div className="col-span-3">
                                    <CaretDivider />
                                </div>

                                <div className="col-span-2">Market Price</div>
                                <div className="text-right">
                                    {dexData && dexData.traderJoe && dexData.traderJoe.priceUsd
                                        ? `$${dexData.traderJoe.priceUsd}`
                                        : 'n/a'}
                                </div>

                                <div className="col-span-2">Native Price AVAX</div>
                                <div className="text-right">
                                    {dexData && dexData.traderJoe && dexData.traderJoe.priceNative
                                        ? dexData.traderJoe.priceNative
                                        : 'n/a'}
                                </div>

                                <div className="col-span-2">DGNX in LP</div>
                                <div className="text-right">
                                    {dexData &&
                                    dexData.traderJoe &&
                                    dexData.traderJoe.liquidity &&
                                    dexData.traderJoe.liquidity.base
                                        ? toReadableNumber(dexData.traderJoe.liquidity.base, 0, {
                                              maximumFractionDigits: 0,
                                              minimumFractionDigits: 0,
                                          })
                                        : 'n/a'}
                                </div>

                                <div className="col-span-2">Price Change 24h</div>
                                <div className="text-right">
                                    {dexData && dexData.traderJoe && dexData.traderJoe.priceChange ? (
                                        <span
                                            className={clsx(
                                                dexData.traderJoe.priceChange.h24 > 0
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            )}
                                        >
                                            {dexData.traderJoe.priceChange.h24 ? (
                                                <>
                                                    {dexData.traderJoe.priceChange.h24 > 0 ? '↑' : '↓'}{' '}
                                                    {dexData.traderJoe.priceChange.h24}%
                                                </>
                                            ) : (
                                                'n/a'
                                            )}
                                        </span>
                                    ) : (
                                        'n/a'
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg bg-dapp-blue-800 p-4">
                            <div className="grid grid-cols-3">
                                <div className="col-span-3 font-bold">Pangolin</div>
                                <div className="col-span-3">
                                    <CaretDivider />
                                </div>

                                <div className="col-span-2">Market Price</div>
                                <div className="text-right">
                                    {dexData && dexData.pangolin && dexData.pangolin.priceUsd
                                        ? `$${dexData.pangolin.priceUsd}`
                                        : 'n/a'}
                                </div>

                                <div className="col-span-2">Native Price AVAX</div>
                                <div className="text-right">
                                    {dexData && dexData.pangolin && dexData.pangolin.priceNative
                                        ? dexData.pangolin.priceNative
                                        : 'n/a'}
                                </div>

                                <div className="col-span-2">DGNX in LP</div>
                                <div className="text-right">
                                    {dexData &&
                                    dexData.pangolin &&
                                    dexData.pangolin.liquidity &&
                                    dexData.pangolin.liquidity.base
                                        ? toReadableNumber(dexData.pangolin.liquidity.base, 0, {
                                              maximumFractionDigits: 0,
                                              minimumFractionDigits: 0,
                                          })
                                        : 'n/a'}
                                </div>

                                <div className="col-span-2">Price Change 24h</div>
                                <div className="text-right">
                                    {dexData && dexData.pangolin && dexData.pangolin.priceChange ? (
                                        <span
                                            className={clsx(
                                                dexData.pangolin.priceChange.h24 > 0
                                                    ? 'text-green-600'
                                                    : dexData.pangolin.priceChange.h24 < 0
                                                    ? 'text-red-600'
                                                    : ''
                                            )}
                                        >
                                            {dexData.pangolin.priceChange.h24 ? (
                                                <>
                                                    {dexData.pangolin.priceChange.h24 > 0 ? '↑' : '↓'}{' '}
                                                    {dexData.pangolin.priceChange.h24}%
                                                </>
                                            ) : (
                                                '0%'
                                            )}
                                        </span>
                                    ) : (
                                        '0%'
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Tile>
                <Tile className="col-span-2 flex flex-col gap-4 xl:col-span-1">
                    <div className="text-2xl font-bold text-dark dark:text-dapp-cyan-50">Ø Averages</div>
                    <div className="h-full rounded-lg bg-dapp-blue-800 p-4">
                        <div className="grid grid-cols-3">
                            <div className="col-span-2">Market cap</div>
                            <div className="text-right">
                                {dexData &&
                                dexData.traderJoe &&
                                dexData.traderJoe.priceUsd &&
                                burnAmount &&
                                lockerAmount
                                    ? `$${toReadableNumber(
                                          (21000000 - burnAmount - lockerAmount) * Number(dexData.traderJoe.priceUsd),
                                          0,
                                          { maximumFractionDigits: 0, minimumFractionDigits: 0 }
                                      )}`
                                    : 'n/a'}
                            </div>

                            <div className="col-span-2">Market cap FDV</div>
                            <div className="text-right">
                                {dexData && dexData.traderJoe && dexData.traderJoe.priceUsd && burnAmount
                                    ? `$${toReadableNumber(
                                          (21000000 - burnAmount) * Number(dexData.traderJoe.priceUsd),
                                          0,
                                          { maximumFractionDigits: 0, minimumFractionDigits: 0 }
                                      )}`
                                    : 'n/a'}
                            </div>

                            <div className="col-span-2">Market price</div>
                            <div className="text-right">
                                {dexData &&
                                dexData.traderJoe?.priceUsd &&
                                dexData.traderJoe?.liquidity?.usd &&
                                dexData.pangolin?.priceUsd &&
                                dexData.pangolin?.liquidity?.usd
                                    ? `$${toReadableNumber(
                                          (dexData.traderJoe.liquidity.usd * Number(dexData.traderJoe.priceUsd) +
                                              dexData.pangolin.liquidity.usd * Number(dexData.pangolin.priceUsd)) /
                                              (dexData.traderJoe.liquidity.usd + dexData.pangolin.liquidity.usd),
                                          0,
                                          { maximumFractionDigits: 5, minimumFractionDigits: 2 }
                                      )}`
                                    : 'n/a'}
                            </div>

                            <div className="col-span-2">Native price</div>
                            <div className="text-right">
                                {dexData &&
                                dexData.traderJoe?.priceNative &&
                                dexData.traderJoe?.liquidity?.base &&
                                dexData.pangolin?.priceNative &&
                                dexData.pangolin?.liquidity?.base
                                    ? `$${toReadableNumber(
                                          (dexData.traderJoe.liquidity.base * Number(dexData.traderJoe.priceNative) +
                                              dexData.pangolin.liquidity.base * Number(dexData.pangolin.priceNative)) /
                                              (dexData.traderJoe.liquidity.base + dexData.pangolin.liquidity.base),
                                          0,
                                          { maximumFractionDigits: 5, minimumFractionDigits: 2 }
                                      )}`
                                    : 'n/a'}
                            </div>

                            <div className="col-span-2">Backing price</div>
                            <div className="text-right">
                                {backingAmountUsd
                                    ? `$${toReadableNumber(backingAmountUsd, 0, {
                                          maximumFractionDigits: 5,
                                          minimumFractionDigits: 2,
                                      })}`
                                    : 'n/a'}
                            </div>
                        </div>
                    </div>
                </Tile>
            </div>

            <Tile className="mb-8 h-[600px] gap-8 lg:col-span-3">
                <div className="flex h-full flex-col gap-4">
                    <div className="text-2xl font-bold text-dark dark:text-dapp-cyan-50">Price & Backing</div>
                    <div className="flex-grow">
                        <Chart wantTokenName="USDC.e" />
                    </div>
                </div>
            </Tile>

            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <Tile className="flex flex-col gap-4">
                    <div className="text-2xl font-bold text-dark dark:text-dapp-cyan-50">Supply</div>
                    <div className="rounded-lg bg-dapp-blue-800 p-4">
                        <div className="grid grid-cols-3">
                            <div className="col-span-2">Minted supply</div>
                            <div className="text-right">
                                {toReadableNumber(21000000, 0, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                            </div>

                            <div className="col-span-2">Total</div>
                            <div className="text-right">
                                {burnAmount ? toReadableNumber(21000000 - burnAmount) : 'n/a'}
                            </div>

                            <div className="col-span-2">Burnt</div>
                            <div className="text-right">{burnAmount ? toReadableNumber(burnAmount) : 'n/a'}</div>

                            <div className="col-span-2">Circulating</div>
                            <div className="text-right">
                                {burnAmount && lockerAmount
                                    ? toReadableNumber(21000000 - burnAmount - lockerAmount)
                                    : 'n/a'}
                            </div>

                            <div className="col-span-2">Locked in Treasury</div>
                            <div className="text-right">{lockerAmount ? toReadableNumber(lockerAmount) : 'n/a'}</div>
                        </div>
                    </div>
                </Tile>
                <Tile className="flex flex-col gap-4">
                    <div className="text-2xl font-bold text-dark dark:text-dapp-cyan-50">Volume 24h</div>
                    <div className="h-full rounded-lg bg-dapp-blue-800 p-4">
                        {dexData && (
                            <div className="grid grid-cols-3">
                                <div className="col-span-2">Total</div>
                                <div className="text-right">
                                    $
                                    {toReadableNumber(
                                        Number(dexData.traderJoe?.volume?.h24 ? dexData.traderJoe?.volume?.h24 : 0) +
                                            Number(dexData.pangolin?.volume?.h24 ? dexData.pangolin?.volume?.h24 : 0)
                                    )}
                                </div>

                                <div className="col-span-2">TraderJoe</div>
                                <div className="text-right">
                                    $
                                    {toReadableNumber(
                                        dexData.traderJoe?.volume?.h24 ? dexData.traderJoe?.volume?.h24 : 0
                                    )}
                                </div>

                                <div className="col-span-2">Pangolin</div>
                                <div className="text-right">
                                    $
                                    {toReadableNumber(
                                        dexData.pangolin?.volume?.h24 ? dexData.pangolin?.volume?.h24 : 0
                                    )}
                                </div>

                                <div className="col-span-2">Diff. USD</div>
                                <div className="text-right">
                                    {toReadableNumber(
                                        dexData.traderJoe?.priceUsd && dexData.pangolin?.priceUsd
                                            ? 1 - Number(dexData.traderJoe.priceUsd) / Number(dexData.pangolin.priceUsd)
                                            : 0,
                                        0,
                                        { style: 'percent' }
                                    )}
                                </div>

                                <div className="col-span-2">Diff. AVAX</div>
                                <div className="text-right">
                                    {toReadableNumber(
                                        dexData.traderJoe?.priceNative && dexData.pangolin?.priceNative
                                            ? 1 -
                                                  (dexData.traderJoe.priceNative < dexData.pangolin.priceNative
                                                      ? Number(dexData.traderJoe.priceNative) /
                                                        Number(dexData.pangolin.priceNative)
                                                      : Number(dexData.pangolin.priceNative) /
                                                        Number(dexData.traderJoe.priceNative))
                                            : 0,
                                        0,
                                        { style: 'percent' }
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Tile>
            </div>

            <div className="mb-8">
                <Tile>
                    <H2>Price Changes & Transactions</H2>
                    <div className="mt-4 rounded-lg bg-dapp-blue-800 p-4">
                        <div className="grid grid-cols-3 md:grid-cols-9">
                            <div></div>
                            <div className="text-right font-bold md:col-span-4 md:text-center">Price Change</div>
                            <div className="text-right font-bold md:col-span-4 md:text-center">Buys/Sells Txns</div>

                            <div></div>
                            <div className="hidden text-right md:inline-grid">5m</div>
                            <div className="hidden text-right md:inline-grid">1h</div>
                            <div className="hidden text-right md:inline-grid">6h</div>
                            <div className="text-right">24h</div>
                            <div className="hidden text-right md:inline-grid">5m</div>
                            <div className="hidden text-right md:inline-grid">1h</div>
                            <div className="hidden text-right md:inline-grid">6h</div>
                            <div className="text-right">24h</div>

                            {dexData && (
                                <>
                                    <div className="font-bold">TraderJoe</div>
                                    <div className="hidden text-right md:inline-grid">
                                        <PriceChange item={dexData.traderJoe?.priceChange?.m5} />
                                    </div>
                                    <div className="hidden text-right md:inline-grid">
                                        <PriceChange item={dexData.traderJoe?.priceChange?.h1} />
                                    </div>
                                    <div className="hidden text-right md:inline-grid">
                                        <PriceChange item={dexData.traderJoe?.priceChange?.h6} />
                                    </div>
                                    <div className="text-right">
                                        <PriceChange item={dexData.traderJoe?.priceChange?.h24} />
                                    </div>
                                    <div className="hidden text-right md:inline-grid">
                                        <TxnsCount item={dexData.traderJoe?.txns?.m5} />
                                    </div>
                                    <div className="hidden text-right md:inline-grid">
                                        <TxnsCount item={dexData.traderJoe?.txns?.h1} />
                                    </div>
                                    <div className="hidden text-right md:inline-grid">
                                        <TxnsCount item={dexData.traderJoe?.txns?.h6} />
                                    </div>
                                    <div className="text-right">
                                        <TxnsCount item={dexData.traderJoe?.txns?.h24} />
                                    </div>

                                    <div className="font-bold">Pangolin</div>
                                    <div className="hidden text-right md:inline-grid">
                                        <PriceChange item={dexData.pangolin?.priceChange?.m5} />
                                    </div>
                                    <div className="hidden text-right md:inline-grid">
                                        <PriceChange item={dexData.pangolin?.priceChange?.h1} />
                                    </div>
                                    <div className="hidden text-right md:inline-grid">
                                        <PriceChange item={dexData.pangolin?.priceChange?.h6} />
                                    </div>
                                    <div className="text-right">
                                        <PriceChange item={dexData.pangolin?.priceChange?.h24} />
                                    </div>
                                    <div className="hidden text-right md:inline-grid">
                                        <TxnsCount item={dexData.pangolin?.txns?.m5} />
                                    </div>
                                    <div className="hidden text-right md:inline-grid">
                                        <TxnsCount item={dexData.pangolin?.txns?.h1} />
                                    </div>
                                    <div className="hidden text-right md:inline-grid">
                                        <TxnsCount item={dexData.pangolin?.txns?.h6} />
                                    </div>
                                    <div className="text-right">
                                        <TxnsCount item={dexData.pangolin?.txns?.h24} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Tile>
            </div>

            {/* <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <Tile>
                    <WalletInfo name="Marketing" address="0x16eF18E42A7d72E52E9B213D7eABA269B90A4643" />
                </Tile>
                <Tile>
                    <WalletInfo name="Platform" address="0xcA01A9d36F47561F03226B6b697B14B9274b1B10" />
                </Tile>
            </div> */}
        </div>
    )
}
