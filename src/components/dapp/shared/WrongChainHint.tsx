import clsx from 'clsx'
import { getChainById } from 'shared/supportedChains'
import { useSwitchChain } from 'wagmi'
import { Tile } from './Tile'
import { Chain } from 'viem'
import { useEffect, useState } from 'react'

type WrongChainHintProps = {
    chainIdProtocol?: number
    chainIdAccount?: number
    className?: string
}

export const WrongChainHint = ({ chainIdProtocol, chainIdAccount, className }: WrongChainHintProps) => {
    const { switchChain } = useSwitchChain()
    const [chainProtocol, setChainProtocol] = useState<Chain>()
    const [chainAccount, setChainAccount] = useState<Chain>()
    useEffect(() => {
        chainIdProtocol && setChainProtocol(getChainById(chainIdProtocol))
    }, [chainIdProtocol])

    useEffect(() => {
        chainIdAccount && setChainAccount(getChainById(chainIdAccount))
    }, [chainIdAccount])

    if (!chainAccount || !chainProtocol || chainProtocol.id == chainAccount.id) return <></>

    return (
        <Tile className={clsx([`flex flex-col items-center gap-8 md:flex-row`, className])}>
            <p className="flex-grow-1 w-full">
                {chainAccount && (
                    <>
                        You&apos;re connected to the <span className="font-bold">{chainAccount.name}</span>, but you
                        need to be connected to <span className="font-bold">{chainProtocol.name}</span>
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
