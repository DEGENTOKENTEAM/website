import { DGNX_ADDRESS } from '@dappconstants'
import { useGetERC20BalanceOf } from '@dapphooks/shared/useGetERC20BalanceOf'
import { useGetERC20TotalSupply } from '@dapphooks/shared/useGetERC20TotalSupply'
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
const numberFormatter4 = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
})
const percentFormatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
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
            balance += parseInt(walletData.find((item) => !item.tokenAddress)?.balance)
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
            `https://safe-transaction-avalanche.safe.global/api/v1/safes/${address}/balances/usd/?trusted=false&exclude_spam=true`
        )
        addressDataCache[address] = dataRaw.json()
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
                    <div className="flex-grow">BTC</div>
                    <div className="col-span-2">
                        {showAmount(walletData, ['0x152b9d0FdC40C096757F570A51E494bd4b943E50'])}{' '}
                    </div>
                    <div className="flex-grow">Stablecoins</div>
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
    const [disburserAmount, setDisburserAmount] = useState<number>()
    const [lockerAmount, setLockerAmount] = useState<number>()
    const [backingAmountUsd, setBackingAmountUsd] = useState<number>()

    const { data: balanceOfDeadAddress } = useGetERC20BalanceOf(
        DGNX_ADDRESS,
        '0x000000000000000000000000000000000000dead',
        chainId
    )
    const { data: balanceOfDisburser } = useGetERC20BalanceOf(
        DGNX_ADDRESS,
        '0x8a0e3264da08bf999aff5a50aabf5d2dc89fab79',
        chainId
    )
    const { data: balanceOfLocker } = useGetERC20BalanceOf(
        DGNX_ADDRESS,
        '0x2c7d8bb6aba4fff56cddbf9ea47ed270a10098f7',
        chainId
    )
    const { data: dataTotalSupply } = useGetERC20TotalSupply(DGNX_ADDRESS, chainId)

    useEffect(() => {
        balanceOfDisburser && setDisburserAmount(Number(balanceOfDisburser / 10n ** 18n))
    }, [balanceOfDisburser])

    useEffect(() => {
        balanceOfLocker && setLockerAmount(Number(balanceOfLocker / 10n ** 18n))
    }, [balanceOfLocker])

    useEffect(() => {
        if (dataTotalSupply && balanceOfDeadAddress)
            setBurnAmount(Number((DGNX_INITIAL_SUPPLY - dataTotalSupply + balanceOfDeadAddress) / 10n ** 18n))
    }, [balanceOfDeadAddress, dataTotalSupply, DGNX_INITIAL_SUPPLY])

    useEffect(() => {
        fetch('https://api.dexscreener.com/latest/dex/tokens/0x51e48670098173025C477D9AA3f0efF7BF9f7812')
            .then((res) => res.json())
            .then((data) => {
                const traderJoe = data.pairs.find((pair) => pair.dexId === 'traderjoe')
                const pangolin = data.pairs.find((pair) => pair.dexId === 'pangolin')
                setDexData({ traderJoe, pangolin })
            })

        getBackingAmount().then(setBackingAmountUsd)
    }, [])

    return (
        <div>
            <h1 className="mb-5 mt-4 flex flex-col gap-1 px-8 font-title text-3xl font-bold tracking-wide sm:mb-8 sm:flex-row sm:px-0">
                <span className="text-techGreen">DEGENX</span>
                <span className="text-degenOrange">DASHBOARD</span>
            </h1>
            <div className="mb-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
                <Tile className="col-span-2">
                    <H2>Decentralized Exchanges</H2>
                    {dexData ? (
                        <div className="flex flex-col gap-8 sm:flex-row">
                            <div className="flex-grow">
                                <div className="font-bold text-light-100">TraderJoe</div>
                                <div className="flex">
                                    <div className="flex-grow">Market Price</div>
                                    <div>${dexData.traderJoe.priceUsd}</div>
                                </div>
                                <div className="flex">
                                    <div className="flex-grow">Native Price AVAX</div>
                                    <div>{dexData.traderJoe.priceNative}</div>
                                </div>
                                <div className="flex">
                                    <div className="flex-grow">DGNX in Liq. pool</div>
                                    <div>{dexData.traderJoe.liquidity.base}</div>
                                </div>

                                <div className="flex">
                                    <div className="flex-grow">Price Change 24h</div>
                                    <div
                                        className={clsx(
                                            dexData.traderJoe.priceChange.h24 > 0 ? 'text-green-600' : 'text-red-600'
                                        )}
                                    >
                                        {dexData.traderJoe.priceChange.h24 > 0 ? '↑' : '↓'}
                                        {dexData.traderJoe.priceChange.h24}%
                                    </div>
                                </div>
                            </div>
                            <div className="flex-grow">
                                <div className="font-bold text-dark dark:text-light-100">Pangolin</div>
                                <div className="flex">
                                    <div className="flex-grow">Market Price</div>
                                    <div>${dexData.pangolin.priceUsd}</div>
                                </div>

                                <div className="flex">
                                    <div className="flex-grow">Native Price AVAX</div>
                                    <div>{dexData.pangolin.priceNative}</div>
                                </div>

                                <div className="flex">
                                    <div className="flex-grow">DGNX in Liq. pool</div>
                                    <div>{dexData.pangolin.liquidity.base}</div>
                                </div>
                                <div className="flex">
                                    <div className="flex-grow">Price Change 24h</div>
                                    <div
                                        className={clsx(
                                            dexData.pangolin.priceChange.h24 > 0 ? 'text-green-600' : 'text-red-600'
                                        )}
                                    >
                                        {dexData.pangolin.priceChange.h24 > 0 ? '↑' : '↓'}
                                        {dexData.pangolin.priceChange.h24}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        '...'
                    )}
                </Tile>
                <Tile className="col-span-2 xl:col-span-1">
                    <H2>Ø Averages</H2>
                    {dexData ? (
                        <div className="flex">
                            <div className="flex-grow">Market cap</div>
                            <div>
                                $
                                {burnAmount && disburserAmount && lockerAmount
                                    ? numberFormatter2.format(
                                          (21000000 - burnAmount - disburserAmount - lockerAmount) *
                                              parseFloat(dexData.traderJoe.priceUsd)
                                      )
                                    : '...'}
                            </div>
                        </div>
                    ) : null}
                    {dexData ? (
                        <div className="flex">
                            <div className="flex-grow">Market cap FDV</div>
                            <div>
                                $
                                {burnAmount
                                    ? numberFormatter2.format(
                                          (21000000 - burnAmount) * parseFloat(dexData.traderJoe.priceUsd)
                                      )
                                    : '...'}
                            </div>
                        </div>
                    ) : null}
                    {dexData ? (
                        <div className="flex">
                            <div className="flex-grow">Market price</div>
                            <div>
                                $
                                {numberFormatter4.format(
                                    (dexData.traderJoe.liquidity.usd * parseFloat(dexData.traderJoe.priceUsd) +
                                        dexData.pangolin.liquidity.usd * parseFloat(dexData.pangolin.priceUsd)) /
                                        (dexData.traderJoe.liquidity.usd + dexData.pangolin.liquidity.usd)
                                )}
                            </div>
                        </div>
                    ) : null}
                    {dexData ? (
                        <div className="flex">
                            <div className="flex-grow">Native price</div>
                            <div>
                                {numberFormatter4.format(
                                    (dexData.traderJoe.liquidity.base * parseFloat(dexData.traderJoe.priceNative) +
                                        dexData.pangolin.liquidity.base * parseFloat(dexData.pangolin.priceNative)) /
                                        (dexData.traderJoe.liquidity.base + dexData.pangolin.liquidity.base)
                                )}{' '}
                                AVAX
                            </div>
                        </div>
                    ) : null}
                    {dexData ? (
                        <div className="flex">
                            <div className="flex-grow">LB price per DGNX</div>
                            <div>${backingAmountUsd && numberFormatter4.format(backingAmountUsd)}</div>
                        </div>
                    ) : null}
                </Tile>
            </div>

            <Tile className="mb-8 h-[600px] gap-8 lg:col-span-3">
                <div className="flex h-full flex-col">
                    <H2>Price & Backing</H2>
                    <div className="flex-grow">
                        <Chart wantTokenName="USDC.e" />
                    </div>
                </div>
            </Tile>

            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <Tile>
                    <H2>Supply</H2>
                    {/* <div className="flex">
                        <div className="flex-grow">Minted supply</div>
                        <div>21,000,000.00</div>
                    </div> */}
                    <div className="flex">
                        <div className="flex-grow">Total supply</div>
                        <div>{burnAmount ? numberFormatter2.format(21000000 - burnAmount) : '...'}</div>
                    </div>
                    <div className="flex">
                        <div className="flex-grow">DGNX Burnt</div>
                        <div>{burnAmount ? numberFormatter2.format(burnAmount) : '...'}</div>
                    </div>
                    <div className="flex">
                        <div className="flex-grow">Circulating supply</div>
                        <div>
                            {burnAmount && disburserAmount && lockerAmount
                                ? numberFormatter2.format(21000000 - burnAmount - disburserAmount - lockerAmount)
                                : '...'}
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-grow">Locked in Disburser</div>
                        <div>{disburserAmount ? numberFormatter2.format(disburserAmount) : '...'}</div>
                    </div>
                    <div className="flex">
                        <div className="flex-grow">Locked in DAO Locker</div>
                        <div>{lockerAmount ? numberFormatter2.format(lockerAmount) : '...'}</div>
                    </div>
                </Tile>
                <Tile>
                    <H2>Volume 24h</H2>
                    {dexData ? (
                        <div className="flex">
                            <div className="flex-grow">TraderJoe</div>
                            <div>${numberFormatter2.format(parseFloat(dexData.traderJoe.volume.h24))}</div>
                        </div>
                    ) : null}
                    {dexData ? (
                        <div className="flex">
                            <div className="flex-grow">Pangolin</div>
                            <div>${numberFormatter2.format(parseFloat(dexData.pangolin.volume.h24))}</div>
                        </div>
                    ) : null}
                    {dexData ? (
                        <div className="flex">
                            <div className="flex-grow">Total</div>
                            <div>
                                $
                                {numberFormatter2.format(
                                    parseFloat(dexData.pangolin.volume.h24) + parseFloat(dexData.traderJoe.volume.h24)
                                )}
                            </div>
                        </div>
                    ) : null}
                    {dexData ? (
                        <div className="flex">
                            <div className="flex-grow">Price diff. USD</div>
                            <div>
                                {percentFormatter.format(
                                    1 - parseFloat(dexData.traderJoe.priceUsd) / parseFloat(dexData.pangolin.priceUsd)
                                )}
                            </div>
                        </div>
                    ) : null}
                    {dexData ? (
                        <div className="flex">
                            <div className="flex-grow">Price diff. AVAX</div>
                            <div>
                                {percentFormatter.format(
                                    1 -
                                        parseFloat(dexData.traderJoe.priceNative) /
                                            parseFloat(dexData.pangolin.priceNative)
                                )}
                            </div>
                        </div>
                    ) : null}
                </Tile>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <Tile>
                    <H2>Price change</H2>
                    {dexData ? (
                        <table className="min-w-full">
                            <tbody className="">
                                <tr>
                                    <td className=""></td>
                                    <td className="px-6 text-right font-bold text-dark dark:text-light-100 lg:px-1 xl:px-2 2xl:px-6">
                                        TraderJoe
                                    </td>
                                    <td className="px-6 text-right font-bold text-dark dark:text-light-100 lg:px-1 xl:px-2 2xl:px-6">
                                        Pangolin
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">5m</td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <PriceChange item={dexData.traderJoe.priceChange.m5} />
                                    </td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <PriceChange item={dexData.pangolin.priceChange.m5} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">1h</td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <PriceChange item={dexData.traderJoe.priceChange.h1} />
                                    </td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <PriceChange item={dexData.pangolin.priceChange.h1} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">6h</td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <PriceChange item={dexData.traderJoe.priceChange.h6} />
                                    </td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <PriceChange item={dexData.pangolin.priceChange.h6} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">24h</td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <PriceChange item={dexData.traderJoe.priceChange.h24} />
                                    </td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <PriceChange item={dexData.pangolin.priceChange.h24} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    ) : null}
                </Tile>
                <Tile>
                    <H2>Transactions (buys / sells)</H2>
                    {dexData ? (
                        <table className="min-w-full">
                            <tbody className="">
                                <tr>
                                    <td className=""></td>
                                    <td className="px-6 text-right font-bold text-dark dark:text-light-100 lg:px-1 xl:px-2 2xl:px-6">
                                        TraderJoe
                                    </td>
                                    <td className="px-6 text-right font-bold text-dark dark:text-light-100 lg:px-1 xl:px-2 2xl:px-6">
                                        Pangolin
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">5m</td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <TxnsCount item={dexData.traderJoe.txns.m5} />
                                    </td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <TxnsCount item={dexData.pangolin.txns.m5} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">1h</td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <TxnsCount item={dexData.traderJoe.txns.h1} />
                                    </td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <TxnsCount item={dexData.pangolin.txns.h1} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">6h</td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <TxnsCount item={dexData.traderJoe.txns.h6} />
                                    </td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <TxnsCount item={dexData.pangolin.txns.h6} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">24h</td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <TxnsCount item={dexData.traderJoe.txns.h24} />
                                    </td>
                                    <td className="px-6 text-right lg:px-1 xl:px-2 2xl:px-6">
                                        <TxnsCount item={dexData.pangolin.txns.h24} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    ) : null}
                </Tile>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <Tile>
                    <WalletInfo name="Marketing" address="0x16eF18E42A7d72E52E9B213D7eABA269B90A4643" />
                </Tile>
                <Tile>
                    <WalletInfo name="Platform" address="0xcA01A9d36F47561F03226B6b697B14B9274b1B10" />
                </Tile>
            </div>
        </div>
    )
}
