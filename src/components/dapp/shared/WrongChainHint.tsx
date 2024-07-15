import clsx from 'clsx'
import { getChainById } from 'shared/supportedChains'
import { useAccount, useSwitchChain } from 'wagmi'
import { Tile } from './Tile'

export const WrongChainHint = ({ chainId }: { chainId: number }) => {
    const { switchChain } = useSwitchChain()
    const { chain } = useAccount()
    const targetChain = getChainById(chainId)
    return (
        <Tile className="flex flex-col items-center gap-8 md:flex-row">
            <p className="flex-grow-1 w-full">
                {chain && (
                    <>
                        You&apos;re connected to the wrong network: {chain.name}
                    </>
                )}
            </p>
            <div className="flex w-full flex-shrink-[20] justify-end">
                <button
                    onClick={() => {
                        switchChain({ chainId })
                    }}
                    className={clsx(
                        'flex items-center gap-1 whitespace-nowrap rounded-lg bg-light-100 px-3 py-2 font-bold text-light-800 transition-colors  hover:bg-degenOrange dark:bg-dapp-blue-400 dark:text-dapp-cyan-50 dark:hover:bg-dapp-blue-200'
                    )}
                >
                    Switch to {targetChain.name}
                </button>
            </div>
        </Tile>
    )
}
