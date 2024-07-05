import BigNumber from 'bignumber.js'
import { BigNumberish, ethers } from 'ethers'

export const BNtoNumber = (
    number: ethers.BigNumber | BigNumber,
    decimals: number | BigNumber
) => {
    return BigNumber(number.toString())
        .div(BigNumber(10).pow(decimals))
        .toNumber()
}

/**
 * Show decimal digits maximum. Eg with precision = 2
 * 0.000022123 => 0.000022
 * 12.345 => 12.34
 * 1234 => 1234
 *
 * @param x The number
 * @param precision The number of decimal
 */
export const toPrecision = (x: number, precision = 2) => {
    const numberOfDigits = Math.floor(Math.log10(x)) + 1
    return x.toPrecision(Math.max(numberOfDigits, precision))
}

export const toReadableNumber = (
    amount: BigNumberish = 0,
    decimals: BigNumberish = 0,
    options?: {
        maximumFractionDigits?: number
        minimumFractionDigits?: number
        asNumber?: boolean
    }
) => {
    if (BigNumber(amount.toString()).eq(0)) return '0'

    const no = BigNumber(amount.toString())
        .div(BigNumber(10).exponentiatedBy(decimals.toString()))
        .toNumber()

    let maximumFractionDigits = options?.maximumFractionDigits || 7
    let minimumFractionDigits = options?.minimumFractionDigits || 2

    while (no < 1 / 10 ** minimumFractionDigits) {
        minimumFractionDigits++
        if (minimumFractionDigits > maximumFractionDigits)
            maximumFractionDigits = minimumFractionDigits + 3
    }

    return no.toLocaleString(navigator.language, {
        maximumFractionDigits,
        minimumFractionDigits,
    })
}

export function nFormatter(num: number, digits: number) {
    const lookup = [
        { value: 1, symbol: '' },
        { value: 1e3, symbol: 'k' },
        { value: 1e6, symbol: 'M' },
        { value: 1e9, symbol: 'G' },
        { value: 1e12, symbol: 'T' },
        { value: 1e15, symbol: 'P' },
        { value: 1e18, symbol: 'E' },
    ]
    const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/
    const item = lookup.findLast((item) => num >= item.value)
    return item
        ? (num / item.value)
              .toFixed(digits)
              .replace(regexp, '')
              .concat(item.symbol)
        : '0'
}
