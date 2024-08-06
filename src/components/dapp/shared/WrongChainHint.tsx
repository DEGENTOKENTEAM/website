import clsx from 'clsx'
import { getChainById } from 'shared/supportedChains'
import { useSwitchChain } from 'wagmi'
import { Tile } from './Tile'

export const WrongChainHint = ({
    chainIdProtocol,
    chainIdAccount,
}: {
    chainIdProtocol: number
    chainIdAccount: number
}) => {
    const { switchChain } = useSwitchChain()
    const chainProtocol = getChainById(chainIdProtocol)
    const chainAccount = getChainById(chainIdAccount)
    return (
        <Tile className="flex flex-col items-center gap-8 md:flex-row">
            <p className="flex-grow-1 w-full">
                {chainAccount && (
                    <>
                        You&apos;re connected to the wrong network:{' '}
                        {chainAccount.name}
                    </>
                )}
            </p>
            <div className="flex w-full flex-shrink-[20] justify-end">
                <button
                    onClick={() => {
                        switchChain({ chainId: chainProtocol.id })
                    }}
                    className={clsx(
                        'flex items-center gap-1 whitespace-nowrap rounded-lg bg-light-100 px-3 py-2 font-bold text-light-800 transition-colors  hover:bg-degenOrange dark:bg-dapp-blue-400 dark:text-dapp-cyan-50 dark:hover:bg-dapp-blue-200'
                    )}
                >
                    Switch to {chainProtocol.name}
                </button>
            </div>
        </Tile>
    )
}
