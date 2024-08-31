import { ManageStakeXContext } from '@dapphelpers/defitools'
import { nFormatter } from '@dapphelpers/number'
import { Tile } from '@dappshared/Tile'
import dynamic from 'next/dynamic'
import { useContext, useEffect, useState } from 'react'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export const StakingProgressChart = () => {
    const {
        data: { protocol, stakingToken, metrics },
    } = useContext(ManageStakeXContext)

    const [chartData, setChartData] = useState<any>(null)

    useEffect(() => {
        if (!metrics || !metrics.stakeLogs || !metrics.stakeLogs.length) return

        const stakedOnDailyBasis = metrics.stakeLogs.reduce((acc, { timestamp, staked }) => {
            const dayFromTS = timestamp - (timestamp % 86400)

            if (!acc[dayFromTS]) acc[dayFromTS] = 0

            acc[dayFromTS] = staked > acc[dayFromTS] ? staked : acc[dayFromTS]

            return acc
        }, {} as { [timestamp: number]: number })

        const logs = Object.keys(stakedOnDailyBasis).map((key) => ({
            timestamp: Number(key),
            staked: stakedOnDailyBasis[key],
        }))

        setChartData({
            options: {
                chart: {
                    id: `chart-${protocol}`,
                    toolbar: {
                        show: false,
                    },
                    animations: {
                        speed: 500,
                    },
                    selection: {
                        enabled: false,
                    },
                    zoom: {
                        enabled: false,
                    },
                },
                xaxis: {
                    categories: logs.map(({ timestamp }) =>
                        new Date(timestamp * 1000).toLocaleString(navigator.language, {
                            day: '2-digit',
                            month: '2-digit',
                        })
                    ),
                    axisTicks: {
                        show: false,
                    },
                    axisBorder: {
                        color: '#163448',
                    },

                    labels: {
                        rotate: 0,
                        style: {
                            cssClass: 'dapp-apexcharts-xaxis-label',
                        },
                    },
                },
                yaxis: {
                    seriesName: 'Staked',
                    labels: {
                        style: {
                            cssClass: 'dapp-apexcharts-xaxis-label',
                        },
                        formatter: (val: any) => nFormatter(val, 20),
                        offsetX: -16,
                    },
                },
                grid: {
                    borderColor: '#163448',
                    padding: {
                        right: -15,
                    },
                },
                stroke: {
                    show: true,
                    curve: 'smooth',
                    lineCap: 'butt',
                    colors: '#0F978E',
                    width: 2,
                    dashArray: 0,
                },
                tooltip: {
                    enabled: false,
                },
            },
            series: [
                {
                    name: 'stakes',
                    data: logs.map(({ staked }) => Math.floor(staked)),
                },
            ],
        })
    }, [metrics, protocol])

    return (
        <Tile className="w-full">
            <div className="flex flex-row items-center">
                <span className="flex-1 font-title text-xl font-bold">{stakingToken?.symbol} staked over time</span>
            </div>
            {chartData ? (
                <div>
                    <Chart options={chartData.options} series={chartData.series} type="line" />
                </div>
            ) : (
                <div className="mt-4">No data available to provide a chart</div>
            )}
        </Tile>
    )
}
