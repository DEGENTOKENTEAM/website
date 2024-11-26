import { TokenInfoResponse } from '@dapptypes'
import { createContext } from 'react'
import { Address, Chain, zeroAddress } from 'viem'

export const durationFromSeconds = (
    timespan: number,
    options?: {
        long?: boolean
        format?:
            | 'default'
            | 'in-years'
            | 'in-months'
            | 'in-weeks'
            | 'in-days'
            | 'in-hours'
            | 'in-minutes'
            | 'in-days'
    }
) => {
    const isLongForm = options?.long || false
    const format = options?.format || 'default'

    let timespanRest = timespan
    const MINUTE_SECONDS = 60
    const HOUR_SECONDS = 60 * 60
    const DAY_SECONDS = 60 * 60 * 24
    const WEEK_SECONDS = 60 * 60 * 24 * 7
    const MONTH_SECONDS = Math.floor((60 * 60 * 24 * 365) / 12)
    const YEAR_SECONDS = 60 * 60 * 24 * 365

    let years = 0
    let months = 0
    let weeks = 0
    let days = 0
    let hours = 0
    let minutes = 0

    if (
        timespanRest >= YEAR_SECONDS &&
        (format == 'default' || format == 'in-years')
    ) {
        years = Math.floor(timespanRest / YEAR_SECONDS)
        timespanRest %= YEAR_SECONDS
    }

    if (
        timespanRest >= MONTH_SECONDS &&
        (format == 'default' || format == 'in-months')
    ) {
        months = Math.floor(timespanRest / MONTH_SECONDS)
        timespanRest %= MONTH_SECONDS
    }

    if (
        timespanRest >= WEEK_SECONDS &&
        (format == 'default' || format == 'in-weeks')
    ) {
        weeks = Math.floor(timespanRest / WEEK_SECONDS)
        timespanRest %= WEEK_SECONDS
    }

    if (
        timespanRest >= DAY_SECONDS &&
        (format == 'default' || format == 'in-days')
    ) {
        days = Math.floor(timespanRest / DAY_SECONDS)
        timespanRest %= DAY_SECONDS
    }

    if (
        timespanRest >= HOUR_SECONDS &&
        (format == 'default' || format == 'in-hours')
    ) {
        hours = Math.floor(timespanRest / HOUR_SECONDS)
        timespanRest %= HOUR_SECONDS
    }
    if (
        timespanRest >= MINUTE_SECONDS &&
        (format == 'default' || format == 'in-minutes')
    ) {
        minutes = Math.floor(timespanRest / MINUTE_SECONDS)
        timespanRest %= MINUTE_SECONDS
    }

    let ret = ''
    if (years && (format == 'default' || format == 'in-years'))
        ret += `${years}${isLongForm ? ` year${years != 1 ? 's' : ''}` : 'y'}`
    if (months && (format == 'default' || format == 'in-months'))
        ret += `${!!ret ? ', ' : ''}${months}${
            isLongForm ? ` month${months != 1 ? 's' : ''}` : 'mo'
        }`
    if (weeks && (format == 'default' || format == 'in-weeks'))
        ret += `${!!ret ? ', ' : ''}${weeks}${
            isLongForm ? ` week${weeks != 1 ? 's' : ''}` : 'w'
        }`
    if (days && (format == 'default' || format == 'in-days'))
        ret += `${!!ret ? ', ' : ''}${String(days).padStart(2, '0')}${
            isLongForm ? ` day${days != 1 ? 's' : ''}` : 'd'
        }`
    if (hours && (format == 'default' || format == 'in-hours'))
        ret += `${!!ret ? ', ' : ''}${String(hours).padStart(2, '0')}${
            isLongForm ? ` hour${hours != 1 ? 's' : ''}` : 'h'
        }`
    if (minutes && (format == 'default' || format == 'in-minutes'))
        ret += `${!!ret ? ', ' : ''}${String(minutes).padStart(2, '0')}${
            isLongForm ? ` minute${minutes != 1 ? 's' : ''}` : 'm'
        }`
    if (timespanRest && format == 'default')
        ret += `${!!ret ? ', ' : ''}${String(timespanRest).padStart(2, '0')}${
            isLongForm ? ` second${timespanRest != 1 ? 's' : ''}` : 's'
        }`

    return ret
}

export type StakeXContextDataType = {
    protocol: Address
    actionFee: bigint
    actionFeeThreshold: bigint
    actionFeeActive: boolean
    chain?: Chain
    tokens: TokenInfoResponse[]
    isActive: boolean
    isRunning: boolean
    isLoading: boolean
}

export type StakeXContextType = {
    refetchStakes: () => void
    setData: Function
    data: StakeXContextDataType
}

export const StakeXContextInitialData: StakeXContextDataType = {
    protocol: zeroAddress,
    actionFee: 0n,
    actionFeeThreshold: 0n,
    actionFeeActive: true,
    tokens: [],
    isActive: false,
    isRunning: false,
    isLoading: true,
}

export const StakeXContext = createContext<StakeXContextType>({
    refetchStakes: () => {},
    setData: () => {},
    data: {
        ...StakeXContextInitialData,
    },
})
