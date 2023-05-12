import clsx from "clsx"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { HiOutlineExternalLink } from "react-icons/hi"
import { RouteObject } from "react-router-dom"
import { Button } from "../Button"
import { Chart } from "./elements/Chart"
import BigNumber from "bignumber.js"

const numberFormatter2 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const numberFormatter4 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })

const showAmount = (walletData: any, tokenAddresses: string[]) => {
    let totalBalance = 0

    tokenAddresses.forEach(tokenAddress => {
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

        const dataRaw = await fetch(`https://safe-transaction-avalanche.safe.global/api/v1/safes/${address}/balances/usd/?trusted=false&exclude_spam=true`)
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
            <h3 className="text-xl mb-4">{props.name} <a rel="noreferrer" href={`https://snowtrace.io/address/${props.address}`} target="_blank"><HiOutlineExternalLink className="inline text-gray-400" /></a></h3>
            {walletData
            ? (
                <>
                    <div className="flex">
                        <div className="flex-grow">DGNX</div>
                        <div>{showAmount(walletData, ['0x51e48670098173025C477D9AA3f0efF7BF9f7812'])}</div>
                    </div>
                    <div className="flex">
                        <div className="flex-grow">AVAX</div>
                        <div>
                            {showAmount(walletData, ['0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'])}{' '}
                            (${showFiatAmount(walletData, ['0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'])})
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-grow">BTC</div>
                        <div>
                            {showAmount(walletData, ['0x152b9d0FdC40C096757F570A51E494bd4b943E50'])}{' '}
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-grow">Stablecoins</div>
                        <div>${showAmount(walletData, ['0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7'])}</div>
                    </div>
                </>
                    )
                : '...'
            }
        </>
    )
}

const getDgnxAmount = async (address: string) => {
    const dataRaw = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/snowtrace?module=account&action=tokenbalance&contractaddress=0x51e48670098173025c477d9aa3f0eff7bf9f7812&address=${address}`)
    const data = await dataRaw.json()

    if (data.message !== 'OK') {
        // timeout likely, wait a sec and try again
        await new Promise(resolve => setTimeout(resolve, 1000))
        return getDgnxAmount(address)
    }

    return data.result / 10 ** 18
}

const PriceChange = (props: { item: number }) => {
    return (
        <p className={clsx(props.item > 0 ? 'text-green-600' : 'text-red-600')}>
            {props.item > 0 ? '↑' : '↓'}
            {props.item}%
        </p>
    )
}

const TxnsCount = (props: { item: { buys: number, sells: number } }) => {
    if (!props.item) return null
    return (
        <p className={clsx((props.item.buys >= props.item.sells) ? 'text-green-600' : 'text-red-600')}>
            {(props.item.buys >= props.item.sells) ? '↑' : '↓'}
            {props.item.buys}/{props.item.sells}
        </p>
    )
}

const getBackingAmount = async () => {
    const to = Math.floor(new Date().getTime() / 1000)
    const resultRaw = await fetch(`${process.env.NEXT_PUBLIC_BACKING_API_ENDPOINT}/getData/avalanche/0x51e48670098173025c477d9aa3f0eff7bf9f7812/${to}/M/1`)
    const result = await resultRaw.json();
    const backingUsd= result.bars?.[0].wantTokens.find(
        (wantToken) => wantToken.sym === 'USDC.e'
    )

    return new BigNumber(backingUsd.bOne).div(new BigNumber(10).pow(result.tokenData['USDC.e'].decimals)).toNumber()
}

export const Dashboard = (props: RouteObject) => {
    const [dexData, setDexData] = useState<any>()

    const [burnAmount, setBurnAmount] = useState<number>()
    const [disburserAmount, setDisburserAmount] = useState<number>()
    const [lockerAmount, setLockerAmount] = useState<number>()
    const [backingAmountUsd, setBackingAmountUsd] = useState<number>()

    useEffect(() => {
        fetch('https://api.dexscreener.com/latest/dex/tokens/0x51e48670098173025C477D9AA3f0efF7BF9f7812')
            .then(res => res.json())
            .then(data => {
                const traderJoe = data.pairs.find((pair) => pair.dexId === 'traderjoe')
                const pangolin = data.pairs.find((pair) => pair.dexId === 'pangolin')
                setDexData({ traderJoe, pangolin })
            })

        getDgnxAmount('0x000000000000000000000000000000000000dead').then(amount => setBurnAmount(amount as number))
        getDgnxAmount('0x8a0e3264da08bf999aff5a50aabf5d2dc89fab79').then(amount => setDisburserAmount(amount as number))
        getDgnxAmount('0x2c7d8bb6aba4fff56cddbf9ea47ed270a10098f7').then(amount => setLockerAmount(amount as number))

        getBackingAmount().then(setBackingAmountUsd)
    }, [])

    return (
        <div>
            <h1 className="text-4xl mb-4">Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="dark:bg-slate-800 bg-gray-100 p-6 rounded-xl">
                    <h3 className="text-xl">TraderJoe</h3>
                    {dexData
                        ? (
                            <>
                                <p className="text-right text-2xl">${dexData.traderJoe.priceUsd}</p>
                                <p className="text-right">{dexData.traderJoe.priceNative} AVAX</p>
                                <p className="text-right">{dexData.traderJoe.liquidity.base} DGNX in pool</p>
                                <p className={clsx("text-right mb-3", dexData.traderJoe.priceChange.h24 > 0 ? 'text-green-600' : 'text-red-600')}>
                                    {dexData.traderJoe.priceChange.h24 > 0 ? '↑' : '↓'}
                                    {dexData.traderJoe.priceChange.h24}%
                                </p>
                                <Button className="w-full" href="https://traderjoexyz.com/trade?inputCurrency=AVAX&outputCurrency=0x51e48670098173025C477D9AA3f0efF7BF9f7812#/" target="_blank" color="orange">
                                    Buy on TJ    
                                </Button> 
                            </>
                        )
                        : '...'
                    }
                </div>
                <div className="dark:bg-slate-800 bg-gray-100 p-6 rounded-xl">
                    <h3 className="text-xl">Pangolin</h3>
                    {dexData
                        ? (
                            <>
                                <p className="text-right text-2xl">${dexData.pangolin.priceUsd}</p>
                                <p className="text-right">{dexData.pangolin.priceNative} AVAX</p>
                                <p className="text-right">{dexData.pangolin.liquidity.base} DGNX in pool</p>
                                <p className={clsx("text-right mb-3", dexData.pangolin.priceChange.h24 > 0 ? 'text-green-600' : 'text-red-600')}>
                                    {dexData.pangolin.priceChange.h24 > 0 ? '↑' : '↓'}
                                    {dexData.pangolin.priceChange.h24}%
                                </p>
                                <Button className="w-full" href="https://app.pangolin.exchange/#/swap?outputCurrency=0x51e48670098173025c477d9aa3f0eff7bf9f7812" target="_blank" color="orange">
                                    Buy on Pangolin
                                </Button>
                            </>
                        )
                        : '...'
                    }
                </div>
                <div className="dark:bg-slate-800 bg-gray-100 p-6 rounded-xl">
                    <h3 className="text-xl mb-3">Ø Averages</h3>
                    {dexData ? <div className="flex">
                        <div className="flex-grow">Market cap</div>
                        <div>${(burnAmount && disburserAmount && lockerAmount) ? numberFormatter2.format((21000000 - burnAmount - disburserAmount - lockerAmount) * parseFloat(dexData.traderJoe.priceUsd)) : '...'}</div>
                    </div> : null}
                    {dexData ? <div className="flex">
                        <div className="flex-grow">Market cap FDV</div>
                        <div>${burnAmount ? numberFormatter2.format((21000000 - burnAmount) * parseFloat(dexData.traderJoe.priceUsd)) : '...'}</div>
                    </div> : null}
                    {dexData ? <div className="flex">
                        <div className="flex-grow">Market price</div>
                        <div>${numberFormatter4.format((dexData.traderJoe.liquidity.usd * parseFloat(dexData.traderJoe.priceUsd) + dexData.pangolin.liquidity.usd * parseFloat(dexData.pangolin.priceUsd)) / (dexData.traderJoe.liquidity.usd + dexData.pangolin.liquidity.usd))}</div>
                    </div> : null}
                    {dexData ? <div className="flex">
                        <div className="flex-grow">Native price</div>
                        <div>{numberFormatter4.format((dexData.traderJoe.liquidity.base * parseFloat(dexData.traderJoe.priceNative) + dexData.pangolin.liquidity.base * parseFloat(dexData.pangolin.priceNative)) / (dexData.traderJoe.liquidity.base + dexData.pangolin.liquidity.base))} AVAX</div>
                    </div> : null}
                    {dexData ? <div className="flex">
                        <div className="flex-grow">Liquidity backing price</div>
                        <div>${backingAmountUsd && numberFormatter4.format(backingAmountUsd)}</div>
                    </div> : null}
                </div>
            </div>

            <div className="dark:bg-slate-800 bg-gray-100 p-6 rounded-xl lg:col-span-3 h-[600px] gap-8 mb-8">
                <div className="flex flex-col h-full">
                    <h3 className="text-xl">Price & Backing</h3>
                    <div className="flex-grow">
                        <Chart wantTokenName="USDC.e" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="dark:bg-slate-800 bg-gray-100 p-6 rounded-xl">
                    <h3 className="text-xl mb-3">Supply</h3>
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
                        <div>{(burnAmount && disburserAmount && lockerAmount) ? numberFormatter2.format(21000000 - burnAmount - disburserAmount - lockerAmount) : '...'}</div>
                    </div>
                    <div className="flex">
                        <div className="flex-grow">Locked in Disburser</div>
                        <div>{disburserAmount ? numberFormatter2.format(disburserAmount) : '...'}</div>
                    </div>
                    <div className="flex">
                        <div className="flex-grow">Locked in DAO Locker</div>
                        <div>{lockerAmount? numberFormatter2.format(lockerAmount) : '...'}</div>
                    </div>
                </div>
                <div className="dark:bg-slate-800 bg-gray-100 p-6 rounded-xl">
                    <h3 className="text-xl mb-3">Volume 24h</h3>
                    {dexData ? <div className="flex">
                        <div className="flex-grow">TraderJoe</div>
                        <div>${numberFormatter2.format(parseFloat(dexData.traderJoe.volume.h24))}</div>
                    </div> : null}
                    {dexData ? <div className="flex">
                        <div className="flex-grow">Pangolin</div>
                        <div>${numberFormatter2.format(parseFloat(dexData.pangolin.volume.h24))}</div>
                    </div> : null}
                    {dexData ? <div className="flex">
                        <div className="flex-grow">Total</div>
                        <div>${numberFormatter2.format(parseFloat(dexData.pangolin.volume.h24) + parseFloat(dexData.traderJoe.volume.h24))}</div>
                    </div> : null}
                    {dexData ? <div className="flex">
                        <div className="flex-grow">Price diff. USD</div>
                        <div>{percentFormatter.format(1 - parseFloat(dexData.traderJoe.priceUsd) / parseFloat(dexData.pangolin.priceUsd))}</div>
                    </div> : null}
                    {dexData ? <div className="flex">
                        <div className="flex-grow">Price diff. AVAX</div>
                        <div>{percentFormatter.format(1 - parseFloat(dexData.traderJoe.priceNative) / parseFloat(dexData.pangolin.priceNative))}</div>
                    </div> : null}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="dark:bg-slate-800 bg-gray-100 p-6 rounded-xl">
                    <h3 className="text-xl">Price change</h3>
                    {dexData ? <table className="min-w-full">
                        <tbody className="">
                            <tr>
                                <td className=""></td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right font-bold">TraderJoe</td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right font-bold">Pangolin</td>
                            </tr>
                            <tr>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right font-bold">5m</td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><PriceChange item={dexData.traderJoe.priceChange.m5} /></td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><PriceChange item={dexData.pangolin.priceChange.m5} /></td>
                            </tr>
                            <tr>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right font-bold">1h</td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><PriceChange item={dexData.traderJoe.priceChange.h1} /></td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><PriceChange item={dexData.pangolin.priceChange.h1} /></td>
                            </tr>
                            <tr>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right font-bold">6h</td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><PriceChange item={dexData.traderJoe.priceChange.h6} /></td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><PriceChange item={dexData.pangolin.priceChange.h6} /></td>
                            </tr>
                            <tr>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right font-bold">24h</td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><PriceChange item={dexData.traderJoe.priceChange.h24} /></td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><PriceChange item={dexData.pangolin.priceChange.h24} /></td>
                            </tr>
                        </tbody>
                    </table> : null}
                </div>
                <div className="dark:bg-slate-800 bg-gray-100 p-6 rounded-xl">
                    <h3 className="text-xl">Transactions (buys / sells)</h3>
                    {dexData ? <table className="min-w-full">
                        <tbody className="">
                            <tr>
                                <td className=""></td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right font-bold">TraderJoe</td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right font-bold">Pangolin</td>
                            </tr>
                            <tr>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right font-bold">5m</td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><TxnsCount item={dexData.traderJoe.txns.m5} /></td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><TxnsCount item={dexData.pangolin.txns.m5} /></td>
                            </tr>
                            <tr>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right font-bold">1h</td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><TxnsCount item={dexData.traderJoe.txns.h1} /></td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><TxnsCount item={dexData.pangolin.txns.h1} /></td>
                            </tr>
                            <tr>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right font-bold">6h</td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><TxnsCount item={dexData.traderJoe.txns.h6} /></td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><TxnsCount item={dexData.pangolin.txns.h6} /></td>
                            </tr>
                            <tr>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right font-bold">24h</td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><TxnsCount item={dexData.traderJoe.txns.h24} /></td>
                                <td className="px-6 lg:px-1 xl:px-2 2xl:px-6 text-right"><TxnsCount item={dexData.pangolin.txns.h24} /></td>
                            </tr>
                        </tbody>
                    </table> : null}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="dark:bg-slate-800 bg-gray-100 p-6 rounded-xl">
                    <WalletInfo name="Marketing" address="0x16eF18E42A7d72E52E9B213D7eABA269B90A4643" />
                </div>
                <div className="dark:bg-slate-800 bg-gray-100 p-6 rounded-xl">
                    <WalletInfo name="Platform" address="0xcA01A9d36F47561F03226B6b697B14B9274b1B10" />
                </div>
                <div className="dark:bg-slate-800 bg-gray-100 p-6 rounded-xl">
                    <h3 className="text-xl">Burnt</h3>
                    {burnAmount && dexData
                        ? (
                            <>
                                <div className="flex">
                                    <div className="flex-grow">Amount DGNX burnt</div>
                                    <div className="flex">{numberFormatter2.format(burnAmount)}</div>
                                </div>
                                <div className="flex">
                                    <div className="flex-grow">$ value</div>
                                    <div className="flex">${numberFormatter2.format(dexData.pangolin.priceUsd * burnAmount)}</div>
                                </div>
                                <div className="flex">
                                    <div className="flex-grow">% of supply</div>
                                    <div className="flex">{percentFormatter.format(burnAmount / 21000000)}</div>
                                </div>
                            </>
                        )
                        : '...'
                    }
                </div>
            </div>
        </div>
    )
}