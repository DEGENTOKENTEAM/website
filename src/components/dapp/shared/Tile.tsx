import { CSSProperties } from 'react'

type TileProps = {
    className?: string | any
    children?: any
    style?: CSSProperties
}
export const Tile = ({ children, style, className }: TileProps) => {
    return (
        <div
            className={`bg-dapp-blue-600 p-4 text-dapp-cyan-50 sm:rounded-lg sm:p-8 ${className ? className : ''}`}
            style={{ ...style }}
        >
            {children}
        </div>
    )
}
