// maybe put this in sep component
import clsx from 'clsx'
import { RxCaretDown } from 'react-icons/rx'

type CaretDividerProps = {
    color?: 'cyan' | 'default'
}
export const CaretDivider = ({ color = 'default' }: CaretDividerProps) => {
    const border = clsx(
        'my-1 h-[1px] w-full border-t',
        color == 'default' && 'border-t-darkTextLowEmphasis',
        color == 'cyan' && 'border-t-dapp-cyan-500'
    )
    const caret = clsx(
        'size-4',
        color == 'default' && 'text-darkTextLowEmphasis',
        color == 'cyan' && 'text-dapp-cyan-500'
    )
    return (
        <div className="flex w-full flex-row items-center">
            <div className={border}>&nbsp;</div>
            <div className="grow px-2">
                <RxCaretDown className={caret} />
            </div>
            <div className={border}>&nbsp;</div>
        </div>
    )
}
