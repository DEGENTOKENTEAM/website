import clsx from 'clsx'
import { ConnectKitButton } from 'connectkit'
import { PropsWithChildren } from 'react'
import { PiWallet } from 'react-icons/pi'

export const CustomConnectedButton = ({ children }: PropsWithChildren) => {
    return (
        <ConnectKitButton.Custom>
            {({ isConnected, show, address }) => {
                return (
                    <button
                        onClick={show}
                        className={clsx(
                            'flex items-center gap-1 rounded-lg bg-light-100 px-3 py-2 font-bold text-light-800 transition-colors hover:bg-degenOrange  dark:bg-dapp-blue-400 dark:text-dapp-cyan-50 dark:hover:bg-dapp-blue-200'
                        )}
                    >
                        {isConnected ? (
                            <div className="flex flex-row items-center gap-2">
                                <PiWallet /> {address?.slice(0, 6)}...{address?.slice(address.length - 3)}
                            </div>
                        ) : (
                            <span className="flex flex-row items-center gap-2">
                                <PiWallet /> {children ? children : 'Connect'}
                            </span>
                        )}
                    </button>
                )
            }}
        </ConnectKitButton.Custom>
    )
}
