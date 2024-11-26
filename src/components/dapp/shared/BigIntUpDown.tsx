import clsx from 'clsx'
import { ChangeEvent, useState } from 'react'
import { Button } from 'src/components/Button'

type BigIntUpDownProps = {
    value: bigint
    min: bigint
    max: bigint
    step: bigint
    onChange: (value: bigint) => void
    reset?: () => void
    decimals?: bigint
    hideControls?: boolean
}
export const BigIntUpDown = ({ hideControls, max, min, onChange, step, value, decimals }: BigIntUpDownProps) => {
    const [decimalsValue] = useState(decimals ?? 0n)

    const onClick = (steps: bigint) => processNewValue(value + steps)

    const onInputChange = (_event: ChangeEvent<HTMLInputElement>) => {
        _event.preventDefault()
        _event.stopPropagation()
        let enteredNumber = Number(_event.target.value.replace(/(,|\.)/, '.'))
        const diviver = !decimals ? 1 : 10 ** Number(decimals)
        _event.target.value = ''
        processNewValue(BigInt(Math.floor(enteredNumber * diviver).toFixed(0)))
    }

    const processNewValue = (value: bigint) => onChange && onChange(value <= min ? min : value >= max ? max : value)

    return (
        <>
            <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center justify-start">
                    {!hideControls && (
                        <Button disabled={value <= min} onClick={() => onClick(-step)} variant="secondary">
                            -
                        </Button>
                    )}
                </div>
                <div className="text-lg leading-10">
                    <input
                        type="number"
                        value={Number(value) / 10 ** Number(decimalsValue)}
                        onChange={onInputChange}
                        disabled={hideControls}
                        className={`inline w-0 min-w-full rounded-lg border-0 border-none bg-transparent p-0 text-center text-lg leading-9 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${clsx(
                            hideControls ? 'bg-transparent' : 'bg-dapp-blue-50'
                        )}`}
                    />
                </div>
                <div className="flex items-center justify-end">
                    {!hideControls && (
                        <Button disabled={value >= max} onClick={() => onClick(step)} variant="secondary">
                            +
                        </Button>
                    )}
                </div>
            </div>
        </>
    )
}
