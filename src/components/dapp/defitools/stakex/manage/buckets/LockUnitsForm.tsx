import { Button, Input } from '@headlessui/react'
import clsx from 'clsx'
import { ChangeEvent } from 'react'
import { BucketFormParams } from './Form'

export const LockUnits = {
    day: 60 * 60 * 24,
    week: 60 * 60 * 24 * 7,
    month: 60 * 60 * 24 * (365 / 12),
    year: 60 * 60 * 24 * 365,
}

type LockUnitsFormProps = {
    disabled: boolean
    bucketIndex: number
    bucket: BucketFormParams
    onChangeLockPeriod: (_event: ChangeEvent<HTMLInputElement>, bucketIndex: number) => void
    onChangeLockUnit: (bucketIndex: number, lockUnit: keyof typeof LockUnits) => void
}
export const LockUnitsForm = ({
    disabled,
    bucketIndex,
    bucket,
    onChangeLockPeriod,
    onChangeLockUnit,
}: LockUnitsFormProps) => {
    return (
        <div className={clsx(['flex', disabled && 'opacity-50'])}>
            <Input
                type="number"
                onFocus={(event) => event.target.select()}
                onChange={(_event) => onChangeLockPeriod(_event, bucketIndex)}
                disabled={disabled}
                defaultValue={bucket.lockPeriod}
                placeholder="0"
                className="w-1/5 rounded-l-lg border-0 bg-dapp-blue-800 text-center text-sm/6 [appearance:textfield] focus:ring-0 focus:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />

            {Object.keys(LockUnits).map((val) => (
                <Button
                    key={bucketIndex + val}
                    onClick={() => onChangeLockUnit(bucketIndex, val as keyof typeof LockUnits)}
                    disabled={disabled}
                    className={clsx([
                        'grow border-0 border-l border-dapp-blue-200 bg-dapp-blue-800 px-2 text-center text-sm/10 last:rounded-r-lg focus:ring-0 focus:ring-offset-0',
                        val === bucket.lockUnit && '!bg-dapp-blue-100',
                    ])}
                >
                    {val}
                    (s)
                </Button>
            ))}
        </div>
    )
}
