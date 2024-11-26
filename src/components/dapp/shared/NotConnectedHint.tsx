import clsx from 'clsx'
import { ConnectKitButton } from 'connectkit'
import { Tile } from './Tile'

export const NotConnectedHint = () => {
    return (
        <Tile className="flex flex-col items-center gap-8 md:flex-row">
            <p className="w-full grow">
                If you&apos;re the owner of this STAKEX protocol and you want to modify it, you need to be connected
                with your wallet.
            </p>
            <div className="flex w-full shrink-[20] justify-end">
                <ConnectKitButton.Custom>
                    {({ show }) => {
                        return (
                            <button
                                onClick={show}
                                className={clsx(
                                    'flex items-center gap-1 whitespace-nowrap rounded-lg bg-light-100 px-3 py-2 font-bold text-light-800 transition-colors  hover:bg-degenOrange dark:bg-dapp-blue-400 dark:text-dapp-cyan-50 dark:hover:bg-dapp-blue-200'
                                )}
                            >
                                Connect Wallet
                            </button>
                        )
                    }}
                </ConnectKitButton.Custom>
            </div>
        </Tile>
    )
}
