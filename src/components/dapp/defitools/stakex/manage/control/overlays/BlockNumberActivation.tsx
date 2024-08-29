import { Spinner } from '@dappelements/Spinner'
import { BaseOverlay, BaseOverlayProps } from '@dappshared/overlays/BaseOverlay'
import { Input } from '@headlessui/react'
import { useEffect, useRef, useState } from 'react'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { MdError } from 'react-icons/md'
import { Button } from 'src/components/Button'

type BlockNumberActivationProps = BaseOverlayProps & {
    onConfirm: () => void
    onCancel: () => void
    onChange: (blockNumber: bigint | undefined) => void
    error?: any
    isLoading: boolean
    isSuccess: boolean
    isPending: boolean
    currentBlock: bigint | undefined
}

export const BlockNumberActivation = ({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    onChange,
    isLoading,
    isSuccess,
    isPending,
    error,
    currentBlock,
}: BlockNumberActivationProps) => {
    const showSuccessMessage = !error && !isLoading && isSuccess && currentBlock
    const showSpinner = !error && (isLoading || !currentBlock) && !isSuccess
    const showContent = !error && !isLoading && !isSuccess && currentBlock
    const showError = (!!error && !isLoading && !isSuccess) || (!!error && isLoading)

    const blockNumberRef = useRef<HTMLInputElement>(null)
    const [blockNumber, setBlockNumber] = useState<bigint>()

    const onChangeBlockNumber = () => setBlockNumber(BigInt(blockNumberRef.current?.value!))

    useEffect(() => onChange && onChange(blockNumber), [blockNumber, onChange])

    return (
        <BaseOverlay isOpen={isOpen} closeOnBackdropClick={false} onClose={() => {}}>
            {showSuccessMessage && (
                <div>
                    <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                        <IoCheckmarkCircle className="h-[100px] w-[100px] text-success" />
                        <span className="font-bold">Successfully updated the protocol</span>
                    </div>
                    <Button
                        variant="primary"
                        onClick={onClose}
                        className="mt-2 flex w-full items-center justify-center gap-2"
                    >
                        Close
                    </Button>
                </div>
            )}

            {showSpinner && (
                <div>
                    <div className="item-center flex flex-row justify-center">
                        <Spinner theme="dark" className="m-20 !h-24 !w-24" />
                    </div>
                    <div className="w-full text-center">
                        {isPending
                            ? 'Please wait for your wallet to prompt you with a confirmation message'
                            : 'Waiting for your transaction to be processed'}
                    </div>
                </div>
            )}

            {showContent && (
                <div className="flex flex-col gap-6">
                    <div className="text-3xl font-bold">Activation Block</div>
                    <div>
                        <Input
                            type="number"
                            placeholder="0"
                            onChange={onChangeBlockNumber}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="mt-2 w-full rounded-lg border-0 bg-dapp-blue-800 text-left text-2xl leading-10 [appearance:textfield] focus:ring-0 focus:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            ref={blockNumberRef}
                        />
                        <span className="px-2 text-xs">current block: {currentBlock.toString()}</span>
                    </div>
                    <div className="flex w-full flex-row-reverse gap-4">
                        <Button
                            variant="primary"
                            disabled={!blockNumber || blockNumber < currentBlock}
                            onClick={() => onConfirm()}
                            className="w-2/3"
                        >
                            Confirm & Proceed
                        </Button>
                        <Button variant="secondary" onClick={() => onCancel()} className="w-1/3">
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {showError && (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-6 text-center text-base">
                        <MdError className="h-[100px] w-[100px] text-error " />
                        There was an error: <br />
                        {error?.cause?.message}
                        <br />
                        <br />
                        You can either retry the request <br />
                        or cancel the process.
                    </div>
                    <div className="flex w-full flex-row-reverse gap-4">
                        <Button variant="primary" disabled={!blockNumber} onClick={() => onConfirm()} className="w-2/3">
                            Retry
                        </Button>
                        <Button variant="secondary" onClick={() => onCancel()} className="w-1/3">
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </BaseOverlay>
    )
}
