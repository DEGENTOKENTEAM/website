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
    decimals: BigNumberish = 0
) => {
    if (BigNumber(amount.toString()).eq(0)) return '0'

    const no = BigNumber(amount.toString())
        .div(BigNumber(10).exponentiatedBy(decimals.toString()))
        .toNumber()

    let maximumFractionDigits = 7
    let minimumFractionDigits = 2

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
