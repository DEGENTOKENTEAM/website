import type { LiFiWidget } from '@lifi/widget'; 
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { RouteObject } from "react-router-dom"

const LiFiWidgetDynamic = dynamic(
    () => import('@lifi/widget').then((module) => module.LiFiWidget) as any,
    {
        ssr: false,
    },
) as typeof LiFiWidget;

const TradingViewWidget = () => {
    let tvScriptLoadingPromise;
    const onLoadScriptRef = useRef<any>();

    const { theme } = useTheme()

    useEffect(
        () => {
            onLoadScriptRef.current = createWidget;

            if (!tvScriptLoadingPromise) {
                tvScriptLoadingPromise = new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.id = 'tradingview-widget-loading-script';
                    script.src = 'https://s3.tradingview.com/tv.js';
                    script.type = 'text/javascript';
                    script.onload = resolve;

                    document.head.appendChild(script);
                });
            }

            tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

            return () => onLoadScriptRef.current = null;

            function createWidget() {
                if (document.getElementById('tradingview_4246f') && 'TradingView' in window) {
                    // @ts-ignore
                    new window.TradingView.MediumWidget({
                        symbols: [
                            "DGNXWAVAX * COINBASE:AVAXUSD|12M"
                        ],
                        chartOnly: false,
                        width: "100%",
                        height: "100%",
                        locale: "en",
                        colorTheme: theme === 'light' ? 'light' : 'dark',
                        autosize: true,
                        showVolume: false,
                        hideDateRanges: false,
                        hideMarketStatus: false,
                        hideSymbolLogo: false,
                        scalePosition: "right",
                        scaleMode: "Normal",
                        fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
                        fontSize: "10",
                        noTimeScale: true,
                        valuesTracking: "1",
                        changeMode: "price-and-percent",
                        chartType: "candlesticks",
                        upColor: "#22ab94",
                        downColor: "#f7525f",
                        borderUpColor: "#22ab94",
                        borderDownColor: "#f7525f",
                        wickUpColor: "#22ab94",
                        wickDownColor: "#f7525f",
                        container_id: "tradingview_4246f",
                        backgroundColor: theme === 'light' ? '#ffffff' : '#121826'
                    });
                }
            }
        },
        [theme]
    );

    return (
        <div className='tradingview-widget-container'>
            <div id='tradingview_4246f' />
            <div className="tradingview-widget-copyright">
                <a href="https://www.tradingview.com/" rel="noreferrer" target="_blank">tradingview</a>
            </div>
        </div>
    );

}

export const BuyDGNX = (props: RouteObject) => {
    const { theme } = useTheme();
    
    return (
        <>
            <div className="lifi-container">
                <h1 className="text-4xl mb-4">Buy $DGNX</h1>
                <p className="text-sm">Note: the <a href="https://docs.dgnx.finance/whitepaper/tokenomics/tax" target="_blank" rel="noreferrer" className="text-orange-500 underline">10% tax</a> is not included below!</p>
                <div className="flex gap-6">
                    <div className="min-w-[392px]">
                        <LiFiWidgetDynamic
                            config={{
                                fee: 0,
                                disableAppearance: true,
                                containerStyle: {
                                    backgroundColor: 'transparent !important',
                                    width: 392,
                                    // height: 640,
                                    // border: `1px solid rgb(234, 234, 234)`,
                                    // borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'start',
                                    justifyContent: 'left',
                                    // maxWidth: 392,
                                },
                                appearance: (theme !== 'system' ? theme : undefined) as 'dark' | 'light' | undefined,
                                // variant: 'expandable',

                                slippage: 0.15,
                                toChain: 43114,
                                toToken: '0x51e48670098173025c477d9aa3f0eff7bf9f7812',
                            }}
                        />
                    </div>
                    <div className="flex-grow hidden md:block">
                        <TradingViewWidget />
                    </div>
                </div>
            </div>
            <div className="mb-12">
                <h2 className="text-2xl mb-3">FAQ</h2>
                <p className="mt-6">
                    <strong>It hangs on the bridge transaction. What should I do?</strong><br />
                    Sometimes bridges are very slow. So slow, that the swap widget &quot;forgets&quot; that it is swapping
                    and will just hang. But do not worry! Your funds do not disappear suddenly. If it is hanging for a long
                    time (10 minutes or so), check your address on <a className="text-orange-500" href="https://snowtrace.io/" target="_blank" rel="noreferrer">Snowtrace</a>.
                    You should have some tokens over there that are bridged, eg bridged USDC, USDT or even bridged BNB or ETH.
                </p>
                <p>
                    If you identified the token you now own, you can just swap again using our widget with that token on the AVAX chain as input.
                </p>
                <p className="mt-6">
                    <strong>It cannot find a route. What should I do?</strong><br />
                    The widget we use cannot really deal very well with our token tax. Sometimes it cannot find any routes, especially with very
                    low or very high input numbers. If that is the case, please use another method to swap, like <a className="text-orange-500" href="https://app.rubic.exchange/" target="_blank" rel="noreferrer">Rubic</a>.
                </p>
                <p>
                    Note that we are currently building <a className="text-orange-500" href="https://broccoliswap.com/" target="_blank" rel="noreferrer">Broccoliswap</a>, a multichain DEX,
                    with user friendliness and better routing taken into account.
                </p>
                <p className="mt-6">
                    <strong>I need other help</strong><br />
                    Please join our Telegram community group and ask your question over there!{' '}
                    <a className="text-orange-500" href="https://t.me/DegenXportal" target="_blank" rel="noreferrer">Join here</a>
                </p>
            </div>
        </>
    )
}
