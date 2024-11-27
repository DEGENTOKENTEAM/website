import { Field, Radio, RadioGroup } from '@headlessui/react'
import Image from 'next/image'
import { Chain } from 'viem'
import { useAccount } from 'wagmi'

type NetworkSelectorFormProps = {
    chains: Chain[]
    selectedChain: Chain
    onChange: (chain: Chain) => void
}
export const NetworkSelectorForm = ({ chains, selectedChain, onChange }: NetworkSelectorFormProps) => {
    const { isConnected, chain: connectedChain } = useAccount()
    return (
        <RadioGroup value={selectedChain} onChange={onChange} className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {/* {isConnected && connectedChain && connectedChain.id != selected && (
                <div className="text-error/50 md:col-span-2">
                    The network you&apos;ve selected differs the one you&apos;re connected with.{' '}
                    <button
                        onClick={() => {
                            switchChain({ chainId: selected })
                        }}
                        className="cursor-pointer font-bold underline"
                    >
                        Change to {selectedChain.name}
                    </button>
                </div>
            )} */}
            {chains
                .sort((chain) => (chain.testnet ? 1 : -1))
                .sort((chain) => (isConnected && connectedChain && connectedChain.id == chain.id ? -1 : 1))
                .map((chain, i) => (
                    <Field key={i} className="flex w-full items-center ">
                        <Radio
                            value={chain}
                            className="group relative flex w-full cursor-pointer rounded-lg border border-dapp-blue-400 bg-dapp-blue-400 p-2 text-white shadow-md transition focus:outline-none data-[checked]:border-dapp-cyan-500 data-[checked]:bg-dapp-blue-100 data-[focus]:outline-1 data-[focus]:outline-dapp-blue-50"
                        >
                            <div className="flex w-full flex-row items-center justify-between gap-2">
                                <span className="rounded-full bg-dapp-blue-50">
                                    <Image
                                        src={`/chains/${chain.id}.svg`}
                                        alt={`${chain.name} Logo`}
                                        width={20}
                                        height={20}
                                    />
                                </span>
                                <p className="flex-1 text-white">
                                    <span className="text-sm">{chain.name}</span>
                                    {chain.testnet && <sub className="text-xs"> testnet</sub>}
                                </p>
                            </div>
                        </Radio>
                    </Field>
                ))}
        </RadioGroup>
    )
}
