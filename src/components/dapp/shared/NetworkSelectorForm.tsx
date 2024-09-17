import { Field, Radio, RadioGroup } from '@headlessui/react'
import { isNumber } from 'lodash'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { FaRegCircle } from 'react-icons/fa'
import { FaCircleCheck } from 'react-icons/fa6'
import { Chain } from 'viem'
import { useAccount, useSwitchChain } from 'wagmi'

type NetworkSelectorFormProps = {
    chains: Chain[]
    selectedChain: Chain
    onChange: (chain: Chain) => void
}
export const NetworkSelectorForm = ({ chains, selectedChain, onChange }: NetworkSelectorFormProps) => {
    const { isConnected, chain: connectedChain } = useAccount()
    const { switchChain } = useSwitchChain()

    let [selected, setSelected] = useState<number>(selectedChain.id)

    useEffect(() => {
        chains &&
            isNumber(selected) &&
            selected != selectedChain.id &&
            onChange &&
            onChange(chains.find((chain) => chain.id == selected)!)
    }, [chains, selected, selectedChain, onChange])

    return (
        <RadioGroup value={selected} onChange={setSelected} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {isConnected && connectedChain && connectedChain.id != selected && (
                <div className="col-span-2 text-error/50">
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
            )}
            {chains
                .sort((chain) => (connectedChain && connectedChain.id == chain.id ? -1 : 1))
                .map((chain, i) => (
                    <Field key={i} className="flex w-full items-center ">
                        <Radio
                            value={chain.id}
                            className="group relative flex w-full cursor-pointer rounded-lg bg-dapp-blue-400 px-5 py-4 text-white shadow-md transition focus:outline-none data-[checked]:bg-dapp-blue-200 data-[focus]:outline-1 data-[focus]:outline-dapp-blue-50"
                        >
                            <div className="flex w-full flex-row items-center justify-between gap-4">
                                <span className="rounded-full bg-dapp-blue-50 p-1">
                                    <Image
                                        src={chain.id == 56 ? `/chains/${chain.id}.png` : `/chains/${chain.id}.svg`}
                                        alt={`${chain.name} Logo`}
                                        width={32}
                                        height={32}
                                    />
                                </span>
                                <p className="flex-1 font-semibold text-white">{chain.name}</p>
                                <FaCircleCheck className="hidden h-6 w-6 fill-white transition group-data-[checked]:block" />
                                <FaRegCircle className="block h-6 w-6 fill-white opacity-30 transition group-data-[checked]:hidden" />
                            </div>
                        </Radio>
                    </Field>
                ))}
        </RadioGroup>
    )
}
