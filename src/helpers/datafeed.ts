type DatafeedOHLC = {
    o: number
    h: number
    l: number
    c: number
    volume?: number
}

type IOHLCV = {
    open: number
    high: number
    low: number
    close: number
    time: number
    volume?: number
}

type DatafeedResult = {
    bars: {
        usd: DatafeedOHLC
        native: DatafeedOHLC
        timestamp: number
        tokenTimeWindow: string
        wantTokens: {
            name: string
            dec: number
            bOne: string
            bOneOHLC: DatafeedOHLC
            price: string
            priceOHLC: DatafeedOHLC
            bTot: string
            bTotOHLC: DatafeedOHLC
        }[]
    }[]
}

const configurationData = {
    supported_resolutions: [
        '1',
        /*'5', '15', '30',*/ '60',
        /* '240', '720',*/ '1D',
    ],
    exchanges: [],
    symbols_types: [],
}

const resolutionToTimeframe = {
    '1': 'M',
    // '5': 'M',
    // '15': 'M',
    // '30': 'M',
    '60': 'H',
    // '240': 'H',
    // '720': 'H',
    '1D': 'D',
}

export const datafeed = () => ({
    onReady: (callback: (x: any) => void) => {
        console.log('[onReady]: Method call')
        setTimeout(() => callback(configurationData))
    },
    searchSymbols: () => {
        console.log('[searchSymbols]: Method call')
    },
    resolveSymbol: (
        symbolName: string,
        onSymbolResolvedCallback: Function,
        onResolveErrorCallback: Function
    ) => {
        console.log('[resolveSymbol]: Method call', symbolName)
        setTimeout(() => {
            return onSymbolResolvedCallback({
                ticker: symbolName,
                name: symbolName,
                description: symbolName,
                type: 'crypto',
                session: '24x7',
                timezone: 'Etc/UTC',
                exchange: '',
                minmov: 1,
                pricescale: 1000000, // @TODO make this dependent on something
                has_intraday: true,
                has_empty_bars: true,
                has_weekly_and_monthly: false,
                supported_resolutions: configurationData.supported_resolutions,
                volume_precision: 2,
                data_status: 'streaming',
            })
        })
    },
    getBars: (
        symbolInfo: { name: string },
        resolution: string,
        periodParams: { from: number; to: number; countBack: number },
        onHistoryCallback: Function,
        onErrorCallback: Function
    ) => {
        console.log(
            '[getBars]: Method call',
            symbolInfo,
            resolution,
            periodParams
        )
        fetch(
            `${process.env.NEXT_PUBLIC_BACKING_API_ENDPOINT}/getData/avalanche/${process.env.NEXT_PUBLIC_TOKEN_ADDRESS}/${periodParams.to}/${resolutionToTimeframe[resolution]}/${periodParams.countBack}`
        )
            .then((x) => x.json())
            .then((data: DatafeedResult) => {
                // Get data based on symbol.
                let bars: IOHLCV[]

                if (symbolInfo.name === 'DGNX/USD') {
                    bars = data.bars?.map((bar) => ({
                        time: bar.timestamp * 1000,
                        open: bar.usd.o,
                        close: bar.usd.c,
                        high: bar.usd.h,
                        low: bar.usd.l,
                        volume: 0,
                    }))
                } else if (symbolInfo.name === 'DGNX/AVAX') {
                    bars = data.bars?.map((bar) => ({
                        time: bar.timestamp * 1000,
                        open: bar.native.o,
                        close: bar.native.c,
                        high: bar.native.h,
                        low: bar.native.l,
                        volume: 0,
                    }))
                } else if (symbolInfo.name.includes('BACKING/')) {
                    const backingtype = symbolInfo.name.split('/')[1]

                    let backingKey = 'bTotOHLC'
                    if (backingtype === 'ONE') {
                        backingKey = 'bOneOHLC'
                    }

                    const wantTokenName = symbolInfo.name.split('/')[2]
                    bars = data.bars.map((bar) => {
                        const backingOhlc = bar.wantTokens.find(
                            (wantToken) => wantToken.name === wantTokenName
                        )?.[backingKey]

                        return {
                            time: bar.timestamp * 1000,
                            open: backingOhlc.o,
                            close: backingOhlc.c,
                            high: backingOhlc.h,
                            low: backingOhlc.l,
                            volume: 0,
                        }
                    })
                }

                setTimeout(() =>
                    onHistoryCallback(bars, { noData: data.bars?.length === 0 })
                )
            })
            .catch(() => {})
    },
    subscribeBars: (
        symbolInfo: any,
        resolution: string,
        onRealtimeCallback: Function,
        subscriberUID: string,
        onResetCacheNeededCallback: Function
    ) => {
        console.log(
            '[subscribeBars]: Method call with subscriberUID:',
            subscriberUID
        )
    },
    unsubscribeBars: (subscriberUID: string) => {
        console.log(
            '[unsubscribeBars]: Method call with subscriberUID:',
            subscriberUID
        )
    },
})
