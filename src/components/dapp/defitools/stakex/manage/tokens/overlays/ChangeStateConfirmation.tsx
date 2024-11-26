import { Spinner } from '@dappelements/Spinner'
import { BaseOverlay, BaseOverlayProps } from '@dappshared/overlays/BaseOverlay'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { MdError } from 'react-icons/md'
import { Button } from 'src/components/Button'

type ChangeStateConfirmationProps = BaseOverlayProps & {
    onConfirm: () => void
    onCancel: () => void
    error?: any
    isLoading: boolean
    isSuccess: boolean
    isPending: boolean
    enabled: boolean
    tokenSymbol: string
    isReward: boolean
}

export const ChangeStateConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    isLoading,
    isSuccess,
    isPending,
    error,
    enabled,
    tokenSymbol,
    isReward,
}: ChangeStateConfirmationProps) => {
    const showSuccessMessage = !error && !isLoading && isSuccess
    const showSpinner = !error && isLoading && !isSuccess
    const showContent = !error && !isLoading && !isSuccess
    const showError = !!error && !isLoading && !isSuccess

    return (
        <BaseOverlay isOpen={isOpen} closeOnBackdropClick={false} onClose={() => {}}>
            {showSuccessMessage && (
                <div>
                    <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                        <IoCheckmarkCircle className="size-[100px] text-success" />
                        <span className="font-bold">
                            {isReward
                                ? `Successfully ${enabled ? 'enabled' : 'disabled'} ${tokenSymbol} as a reward token`
                                : `Successfully ${enabled ? 'enabled' : 'disabled'} ${tokenSymbol} as a payout token`}
                        </span>
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
                    <div className="flex flex-row items-center justify-center">
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
                    <div className="text-3xl font-bold">
                        {enabled ? 'Enable' : 'Disable'} {tokenSymbol}
                        <br />
                        as {isReward ? 'reward' : 'payout'} token
                    </div>
                    <div>
                        You&apos;re about to change the tokens active state.
                        <br />
                        <br />
                        {isReward ? (
                            <span>
                                While changing the rewards state, you will {enabled ? 'allow' : 'deny'} reward deposits
                                of {tokenSymbol} into your staking.
                            </span>
                        ) : (
                            <span>
                                While changing the payout state, you will {enabled ? 'allow' : 'deny'} your stakers to
                                claim their rewards in {tokenSymbol}.
                            </span>
                        )}
                        <br />
                        <br />
                        <span>Click &quot;Confirm & Proceed&quot; if you really want that.</span>
                    </div>
                    <div className="flex w-full flex-row-reverse gap-4">
                        <Button variant="primary" onClick={() => onConfirm()} className="w-2/3">
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
                        <MdError className="size-[100px] text-error " />
                        There was an error: <br />
                        {error?.cause?.shortMessage}
                        <br />
                        <br />
                        You can either retry the request <br />
                        or cancel the process.
                    </div>
                    <div className="flex w-full flex-row-reverse gap-4">
                        <Button variant="primary" onClick={() => onConfirm()} className="w-2/3">
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
