import clsx from 'clsx'
import { ConnectKitButton } from 'connectkit'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { toPrecision } from '../../../helpers/number'
import logoImage from '../../../images/logo_large.png'
import { DarkmodeToggle } from '../../DarkmodeToggle'
import { DappContainer } from './DappContainer'
import Sidebar from './Sidebar'

const TokenImage = (props: { src: string; symbol: string; size?: number }) => {
    const [showImage, setShowImage] = useState(true)

    useEffect(() => {
        setShowImage(true)
    }, [props.src])

    return (
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full">
            <div
                style={{ display: showImage ? undefined : 'flex' }}
                className="absolute hidden h-full w-full items-center justify-center rounded-full bg-slate-800 font-bold text-white"
            >
                {props.symbol[0]}
            </div>
            <Image
                className="absolute"
                width={props.size || 32}
                height={props.size || 32}
                src={props.src}
                alt={`Logo ${props.symbol}`}
                style={{ display: showImage ? undefined : 'none' }}
                onError={(e) => {
                    setShowImage(false)
                }}
            />
        </div>
    )
}

const ConnectedButton = () => {
    const { address, chain } = useAccount()

    const { data: balanceData } = useBalance({
        address,
        chainId: chain?.id,
    })

    return (
        <div className="-my-2 flex items-center gap-0.5 p-0">
            {balanceData && (
                <div className="mr-2 flex items-center border-r border-dapp-blue-800 py-1 pr-2">
                    {chain && (
                        <TokenImage
                            src={`/chains/${chain.id.toString()}.svg`}
                            symbol={chain.nativeCurrency.symbol}
                            size={16}
                        />
                    )}
                    {toPrecision(parseFloat(balanceData?.formatted || '0'), 4)}
                </div>
            )}
            {address?.slice(0, 6)}...{address?.slice(address.length - 3)}
        </div>
    )
}

export function DappHeader() {
    return (
        <header className="absolute z-10 w-full  py-6 lg:fixed">
            <DappContainer>
                <nav className="relative z-50 flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <div className="flex flex-row-reverse items-center sm:flex-row">
                        <div className="mr-3 lg:hidden">
                            <Sidebar mobile />
                        </div>
                        <Link href="/" aria-label="Home">
                            <Image
                                className=""
                                src={logoImage}
                                alt=""
                                // width={48}
                                height={48}
                            />
                        </Link>
                    </div>
                    <div className="flex items-center gap-x-2 md:gap-x-2">
                        <ConnectKitButton.Custom>
                            {({ isConnected, show }) => {
                                return (
                                    <button
                                        onClick={show}
                                        className={clsx(
                                            'flex items-center gap-1 rounded-lg bg-light-100 px-3 py-2 font-bold text-light-800 transition-colors hover:bg-degenOrange  dark:bg-dapp-blue-400 dark:text-dapp-cyan-50 dark:hover:bg-dapp-blue-200'
                                        )}
                                    >
                                        {isConnected ? (
                                            <ConnectedButton />
                                        ) : (
                                            'Connect Wallet'
                                        )}
                                    </button>
                                )
                            }}
                        </ConnectKitButton.Custom>
                        <DarkmodeToggle />
                    </div>
                </nav>
            </DappContainer>
        </header>
    )
}
