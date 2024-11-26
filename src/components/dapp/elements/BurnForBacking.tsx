import { toReadableNumber } from '@dapphelpers/number'
import { useDoBurnForBacking } from '@dapphooks/liquidityBacking/useDoBurnForBacking'
import { useGetBackingFromWantToken } from '@dapphooks/liquidityBacking/useGetBackingForWantToken'
import { useERC20Approve } from '@dapphooks/shared/useERC20Approve'
import { useHasERC20Allowance } from '@dapphooks/shared/useHasERC20Allowance'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { AiOutlineCheckCircle } from 'react-icons/ai'
import { Id, toast } from 'react-toastify'
import { Address, formatUnits, parseUnits } from 'viem'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { Button } from '../../Button'
import { Spinner } from './Spinner'

type BurnForBackingProps = {
    baseTokenAddress: Address
    baseTokenAmount: bigint
    baseTokenDecimals: bigint
    baseTokenSymbol: string
    activeWantToken: {
        decimals: bigint
        address: Address
        info: { name: string }
    }
    onSettingsChange: () => void
    isLoading: boolean
}

export const BurnForBacking = (props: BurnForBackingProps) => {
    const {
        activeWantToken,
        baseTokenAddress,
        baseTokenAmount,
        baseTokenDecimals,
        baseTokenSymbol,
        isLoading,
        onSettingsChange,
    } = props
    const tokensToBurnInputRef = useRef<HTMLInputElement>(null)
    const slippageInputRef = useRef<HTMLInputElement>(null)
    const chainId = +process.env.NEXT_PUBLIC_CHAIN_ID!
    const { switchChain } = useSwitchChain()
    const { address, isConnected, chain: chainAccount } = useAccount()

    const [toastId, setToastId] = useState<Id>()
    const [slippage, setSlippage] = useState(0)
    const [slippageAmount, setSlippageAmount] = useState(0n)
    const [showSlippage, setShowSlippage] = useState(false)

    const [amountToBurn, setAmountToBurn] = useState<bigint>()
    const [amountToBurnEntered, setAmountToBurnEntered] = useState<string>('')

    const [isInApproval, setIsInApproval] = useState(false)
    const [isInBurnForBacking, setIsInBurnForBacking] = useState(false)

    //
    // Hooks
    //
    const { data: dataGetBackingFromWantToken, isLoading: isLoadingGetBackingFromWantToken } =
        useGetBackingFromWantToken(activeWantToken?.address, amountToBurn!, chainId)
    const { data: dataERC20Allowance, refetch: refetchERC20Allowance } = useHasERC20Allowance(
        baseTokenAddress,
        address!,
        process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS! as Address,
        chainId,
        true
    )
    const {
        write: writeERC20Approve,
        isPending: isPendingERC20Approve,
        isSuccess: isSuccessERC20Approve,
        isError: isErrorERC20Approve,
        error: errorERC20Approve,
        hash: hashApproval,
    } = useERC20Approve(
        baseTokenAddress,
        process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS! as Address,
        amountToBurn!,
        chainId
    )
    const {
        write: writeDoBurnForBacking,
        isPending: isPendingDoBurnForBacking,
        isSuccess: isSuccessDoBurnForBacking,
        isError: isErrorDoBurnForBacking,
        error: errorDoBurnForBacking,
        hash: hashDoBurnForBacking,
    } = useDoBurnForBacking(amountToBurn!, activeWantToken?.address, slippageAmount, chainId)

    const resetForm = () => {
        setAmountToBurn(undefined)
        tokensToBurnInputRef.current!.value = ''
    }

    //
    // handler
    //
    const onBackingAmountInputChange = (_event: ChangeEvent<HTMLInputElement>) => {
        _event.preventDefault()
        setAmountToBurnEntered(tokensToBurnInputRef.current!.value)
    }

    //
    // Effects
    //
    useEffect(() => {
        if (!refetchERC20Allowance || !isConnected || !address) return
        refetchERC20Allowance()
    }, [isConnected, refetchERC20Allowance, address])

    useEffect(() => {
        if (Boolean(amountToBurnEntered && baseTokenAmount)) {
            const amountToBurnEnteredProcessable = parseUnits(amountToBurnEntered, Number(baseTokenDecimals))

            const checkAmountToBurnEntered = formatUnits(amountToBurnEnteredProcessable, Number(baseTokenDecimals))

            if (amountToBurnEntered != checkAmountToBurnEntered) {
                setAmountToBurn(0n)
                // TODO error
                return
            }

            if (baseTokenAmount - amountToBurnEnteredProcessable < 0n) {
                setAmountToBurn(0n)
                // TODO error
                return
            } else {
                // TODO reset error
                setAmountToBurn(amountToBurnEnteredProcessable)
            }
        }

        if (!amountToBurnEntered) setAmountToBurn(0n)

        if (amountToBurnEntered) {
        }
    }, [amountToBurnEntered, baseTokenAmount, baseTokenDecimals])

    useEffect(() => {
        if (!isInApproval) return

        if (isPendingERC20Approve) {
            const id = toast.loading('Approval is being processed', {
                autoClose: false,
            })
            setToastId(id)
        } else {
            toastId && toast.dismiss(toastId)

            if (isSuccessERC20Approve) {
                toast.success(`Approval successfully. View on <a href="https://snowscan.xyz/tx/${hashApproval}">`, {
                    autoClose: 3000,
                })
                onSettingsChange()
            }

            if (isErrorERC20Approve && errorERC20Approve)
                toast.error(`Approval failed! Cause: ${errorERC20Approve.message}`, {
                    autoClose: 5000,
                })
        }
    }, [
        hashApproval,
        isInApproval,
        isPendingERC20Approve,
        isSuccessERC20Approve,
        isErrorERC20Approve,
        errorERC20Approve,
        onSettingsChange,
        toastId,
    ])

    useEffect(() => {
        if (!isInBurnForBacking) return

        if (isPendingDoBurnForBacking) {
            const id = toast.loading('Burn is being processed', {
                autoClose: false,
            })
            setToastId(id)
        } else {
            toastId && toast.dismiss(toastId)

            if (isSuccessDoBurnForBacking) {
                toast.success(
                    `Burn for backing successful. View on <a href="https://snowscan.xyz/tx/${hashDoBurnForBacking}">`,
                    {
                        autoClose: 3000,
                    }
                )
                onSettingsChange()
                resetForm()
            }

            if (isErrorDoBurnForBacking && errorDoBurnForBacking)
                toast.error(`Burn for backing failed! Cause: ${errorDoBurnForBacking.message}`, {
                    autoClose: 5000,
                })
        }
    }, [
        hashDoBurnForBacking,
        isInBurnForBacking,
        isPendingDoBurnForBacking,
        isSuccessDoBurnForBacking,
        isErrorDoBurnForBacking,
        errorDoBurnForBacking,
        onSettingsChange,
        toastId,
    ])

    useEffect(() => {
        if (!dataGetBackingFromWantToken || !slippage) return
        setSlippageAmount(BigInt(Math.floor(Number(dataGetBackingFromWantToken) * (1 - slippage / 100))))
    }, [slippage, dataGetBackingFromWantToken])

    if (!isConnected) {
        return <p>Connect wallet to burn {baseTokenSymbol}</p>
    }

    if (!baseTokenAmount || !baseTokenDecimals) {
        return <p>You have no {baseTokenSymbol} to burn on the connected wallet.</p>
    }

    return (
        <>
            <div className="mb-3 py-6">
                {!showSlippage && (
                    <p className="text-right text-xs">
                        Slippage:{' '}
                        <span
                            className="cursor-pointer underline"
                            onClick={() => {
                                setShowSlippage(true)
                            }}
                        >
                            {slippage}%
                        </span>
                    </p>
                )}
                {showSlippage && (
                    <p className="text-right text-xs">
                        Set slippage:{' '}
                        <span
                            className="cursor-pointer hover:underline"
                            onClick={() => {
                                setSlippage(0.5)
                                setShowSlippage(false)
                            }}
                        >
                            0.5%
                        </span>
                        <span className="px-1">|</span>
                        <span
                            className="cursor-pointer hover:underline"
                            onClick={() => {
                                setSlippage(1)
                                setShowSlippage(false)
                            }}
                        >
                            1%
                        </span>
                        <span className="px-1">|</span>
                        <span className="" onClick={() => {}}>
                            <input
                                ref={slippageInputRef}
                                type="text"
                                className="m-0 w-6 border border-dapp-blue-800 bg-dark p-0 text-xs dark:text-light-200"
                            />
                            %
                            <AiOutlineCheckCircle
                                className="ml-1 inline cursor-pointer "
                                onClick={() => {
                                    if (slippageInputRef.current)
                                        setSlippage(parseFloat(slippageInputRef.current.value || '0.5'))
                                    setShowSlippage(false)
                                }}
                            />
                        </span>
                    </p>
                )}
                <input
                    className="my-2 w-full rounded-lg border-0 bg-dapp-blue-800 text-right text-2xl leading-10 [appearance:textfield] focus:ring-0 focus:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    type="number"
                    placeholder="0"
                    disabled={isPendingDoBurnForBacking || isPendingERC20Approve}
                    value={amountToBurnEntered}
                    onChange={onBackingAmountInputChange}
                    ref={tokensToBurnInputRef}
                    onWheel={(e) => {
                        e.currentTarget.blur()
                    }}
                />
                <p className="text-right text-xs">
                    Max:{' '}
                    <span
                        className="cursor-pointer underline"
                        onClick={() => {
                            setAmountToBurn(baseTokenAmount)
                            setAmountToBurnEntered(formatUnits(baseTokenAmount, Number(baseTokenDecimals)))
                        }}
                    >
                        {toReadableNumber(baseTokenAmount, baseTokenDecimals)}
                    </span>{' '}
                    {baseTokenSymbol}
                </p>

                {chainId === 43114 &&
                    amountToBurn !== undefined &&
                    amountToBurn > 0n &&
                    dataERC20Allowance !== undefined && (
                        <div className="flex items-center">
                            {dataERC20Allowance >= amountToBurn ? (
                                <Button
                                    className="mt-3 w-full"
                                    color="orange"
                                    disabled={isPendingDoBurnForBacking}
                                    onClick={() => {
                                        setIsInBurnForBacking(true)
                                        writeDoBurnForBacking && writeDoBurnForBacking()
                                    }}
                                >
                                    {isPendingDoBurnForBacking ? <Spinner /> : 'Burn'}
                                </Button>
                            ) : (
                                <Button
                                    className="mt-3 w-full"
                                    color="orange"
                                    disabled={isPendingERC20Approve}
                                    onClick={() => {
                                        setIsInApproval(true)
                                        writeERC20Approve && writeERC20Approve()
                                    }}
                                >
                                    {isPendingERC20Approve ? <Spinner /> : 'Approve'}
                                </Button>
                            )}
                        </div>
                    )}

                {chainId !== 43114 && amountToBurn !== undefined && amountToBurn > 0n && (
                    <div className="flex items-center">
                        <Button className="mt-3 w-full" color="orange" onClick={() => switchChain({ chainId: 43114 })}>
                            Switch to Avax
                        </Button>
                    </div>
                )}
            </div>

            {amountToBurn !== undefined &&
                amountToBurn > 0n &&
                isLoadingGetBackingFromWantToken &&
                !dataGetBackingFromWantToken && <p className="">Calculating expected output...</p>}
            {amountToBurn !== undefined &&
                dataERC20Allowance !== undefined &&
                amountToBurn > 0n &&
                !isLoadingGetBackingFromWantToken &&
                dataGetBackingFromWantToken &&
                dataGetBackingFromWantToken > 0n && (
                    <>
                        <div />
                        <div className="inline-block ">
                            {dataERC20Allowance >= amountToBurn
                                ? 'Includes token tax, fees, etc'
                                : 'Estimated output. Approve to get exact values'}
                            <div className="flex gap-x-5">
                                <p className="grow">Expected output:</p>
                                <p className="text-right">
                                    {toReadableNumber(dataGetBackingFromWantToken, activeWantToken.decimals)}{' '}
                                    {activeWantToken.info.name}
                                </p>
                            </div>
                            <div className="flex gap-x-5">
                                <p className="grow">Minimum received:</p>
                                <p className="text-right">
                                    {toReadableNumber(slippageAmount, activeWantToken.decimals)}{' '}
                                    {activeWantToken.info.name}
                                </p>
                            </div>
                        </div>
                    </>
                )}
        </>
    )
}
