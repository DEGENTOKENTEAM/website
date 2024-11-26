import { toReadableNumber } from '@dapphelpers/number'
import { useState } from 'react'
import { useInterval } from 'usehooks-ts'

type NumberIncreaserProps = {
    startNumber: bigint
    endNumber: bigint
    decimals: bigint
    duration: bigint
    fractionDigits?: number
}

export const NumberIncreaser = ({
    startNumber,
    endNumber,
    decimals,
    duration,
    fractionDigits,
}: NumberIncreaserProps) => {
    const [currentNumber, setCurrentNumber] = useState(startNumber)
    const [updateInterval, setUpdateInterval] = useState(50)
    const secondTick = duration ? endNumber / duration : 0n
    useInterval(() => {
        if (!endNumber || currentNumber > endNumber) {
            setCurrentNumber(endNumber)
            setUpdateInterval(0)
        } else setCurrentNumber(currentNumber + secondTick / (1000n / BigInt(updateInterval)))
    }, updateInterval)
    return (
        <span className="tabular-nums">
            {toReadableNumber(currentNumber, decimals, {
                minimumFractionDigits: 0,
                maximumFractionDigits: fractionDigits || 3,
            })}
        </span>
    )
}
