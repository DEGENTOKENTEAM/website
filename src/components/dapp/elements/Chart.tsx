import React, { useEffect, useRef, useState } from 'react';
import { setTimeout } from 'timers';
import { datafeed } from '../../../helpers/datafeed';
import clsx from 'clsx';
import { CustomIndicator, IPineStudyResult, LibraryPineStudy, OhlcStudyPlotStyle, RawStudyMetaInfoId } from '../../../../public/charting_library/charting_library';
import { StudyPlotType } from '../../../../public/charting_library/charting_library';
import { BACKING_TYPE, CHART_PRICE_MODE } from '../../../types';
import { useTheme } from 'next-themes';

const applyOverrides = (tv: any, bgColor: string) => {
    try {
        tv?.applyOverrides?.({
            // @ts-ignore
            'paneProperties.backgroundType': "solid",
            "paneProperties.background": bgColor
        })
    } catch (e) { }
}


export const Chart = (props: {
    wantTokenName: string,
    className?: string 
}) => {
    const [backingType, setBackingType] = useState<BACKING_TYPE>(BACKING_TYPE.TOTAL)
    const [priceMode, setPriceMode] = useState<CHART_PRICE_MODE>(CHART_PRICE_MODE.USD)

    const { theme } = useTheme()

    useEffect(() => {
        if (!props?.wantTokenName) {
            return;
        }

        let backingName = 'Total backing'
        if (backingType === BACKING_TYPE.ONE) {
            backingName = 'Backing per 1 DGNX'
        }

        const backingChartName = `${backingName} in ${props.wantTokenName}`

        const bgColor = theme === 'light' ? '#F3F4F6' : '#1e293b'

        // @ts-ignore
        const tv = new TradingView.widget({
            // debug: true,

            symbol: `DGNX/${priceMode}`, // default symbol
            // @ts-ignore
            interval: '1', // default interval
            autosize: true, // displays the chart in the fullscreen mode
            theme: theme === 'light' ? 'Light' : 'Dark',
            disabled_features: ["header_symbol_search", "symbol_search_hot_key", "header_compare"],
            custom_css_url: theme === 'light' ? '/custom_chart_light.css' : '/custom_chart.css',
            custom_font_family: '\'Space Mono\'',
            toolbar_bg: bgColor,
            layoutType: '2h',
            loading_screen: { backgroundColor: bgColor },
            datafeed: datafeed(),
            library_path: '/charting_library/',
            container: 'tv_chart_container',
            custom_indicators_getter: PineJS => {
                return Promise.resolve<CustomIndicator[]>([
                    {
                        name: backingChartName,
                        metainfo: {
                            _metainfoVersion: 51,
                            id: 'Backing@tv-basicstudies-1' as RawStudyMetaInfoId,
                            description: backingChartName,
                            shortDescription: backingChartName,
                            format: {
                                type: 'inherit'
                            },
                            is_hidden_study: false,
                            is_price_study: false,
                            isCustomIndicator: true,
                            plots: [
                                {
                                    id: 'plot_0',
                                    type: 'ohlc_open' as StudyPlotType.OhlcOpen,
                                    target: 'plotcandle_0',
                                },
                                {
                                    id: 'plot_1',
                                    type: 'ohlc_high' as StudyPlotType.OhlcHigh,
                                    target: 'plotcandle_0',
                                },
                                {
                                    id: 'plot_2',
                                    type: 'ohlc_low' as StudyPlotType.OhlcLow,
                                    target: 'plotcandle_0',
                                },
                                {
                                    id: 'plot_3',
                                    type: 'ohlc_close' as StudyPlotType.OhlcClose,
                                    target: 'plotcandle_0',
                                },
                            ],

                            ohlcPlots: {
                                plotcandle_0: {
                                    title: 'Plot candle title',
                                },
                            },

                            defaults: {
                                ohlcPlots: {
                                    plotcandle_0: {
                                        borderColor: '#000000',
                                        color: '#2196F3',
                                        drawBorder: false,
                                        drawWick: true,
                                        plottype: 'ohlc_candles' as OhlcStudyPlotStyle.OhlcCandles, // might be 'ohlc_bars' for bars
                                        visible: true,
                                        wickColor: '#2196F3',
                                    },
                                },
                                precision: 4,
                                inputs: {},
                            },
                            styles: {},
                            inputs: [],
                        },
                        constructor: function() {
                            this.init = function(context, inputCallback) {
                                this._context = context;
                                this._input = inputCallback;

                                const symbol = `BACKING/${backingType}/${props.wantTokenName}`;
                                this._context.new_sym(
                                    symbol,
                                    PineJS.Std.period(this._context)
                                );
                            }

                            this.main = function(context, inputCallback) {
                                this._context = context;
                                this._input = inputCallback;

                                this._context.select_sym(1);

                                var o = PineJS.Std.open(this._context);
                                var h = PineJS.Std.high(this._context);
                                var l = PineJS.Std.low(this._context);
                                var c = PineJS.Std.close(this._context);
                                return [o,h,l,c];

                                // console.log(context)

                                // var direction = Math.sign(Math.random() - 0.5);
                                // var value = Math.random() * 200;

                                // var open  = value + 8 * direction;
                                // var high = value + 15;
                                // var low = value - 15;
                                // var close = value - 8 * direction;

                                // return [open, high, low, close];
                            }
                        }
                    }
                ]);
            },
        });

        tv.onChartReady(() => {
            tv.chart(0).createStudy(backingChartName, false, true);
            tv.createDropdown({
                title: 'Price symbol',
                align: 'left',
                items: [
                    {
                        title: 'DGNX/USD',
                        onSelect: () => {
                            setPriceMode(CHART_PRICE_MODE.USD)
                        }
                    },
                    {
                        title: 'DGNX/AVAX',
                        onSelect: () => {
                            setPriceMode(CHART_PRICE_MODE.AVAX)
                        }
                    }
                ]
            })
            tv.createDropdown({
                title: 'Backing',
                align: 'left',
                items: [
                    {
                        title: 'Total backing',
                        onSelect: () => {
                            setBackingType(BACKING_TYPE.TOTAL)
                        }
                    },
                    {
                        title: 'Backing per DGNX',
                        onSelect: () => {
                            setBackingType(BACKING_TYPE.ONE)
                        }
                    }
                ]
            })
        })

        // Set the bg color in a couple of steps so it always works regarding of the user internet speed
        setTimeout(() => {
            applyOverrides(tv, bgColor)
        }, 200)

        setTimeout(() => {
            applyOverrides(tv, bgColor)
        }, 800)

        setTimeout(() => {
            applyOverrides(tv, bgColor)
        }, 1500)

        setTimeout(() => {
            applyOverrides(tv, bgColor)
        }, 3000)

        setTimeout(() => {
            applyOverrides(tv, bgColor)
        }, 7000)
    }, [props.wantTokenName, backingType, priceMode, theme])

    return (
        <div
            className={clsx(props.className, "h-full w-full")}
            id="tv_chart_container"
        />
    );
};