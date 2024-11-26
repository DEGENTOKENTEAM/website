import { Spinner } from '@dappelements/Spinner'
import { durationFromSeconds } from '@dapphelpers/staking'
import { BaseOverlay, BaseOverlayProps } from '@dappshared/overlays/BaseOverlay'
import { StakeBucket } from '@dapptypes'
import { Field, Radio, RadioGroup } from '@headlessui/react'
import { FaRegCircle } from 'react-icons/fa'
import { FaCircleCheck } from 'react-icons/fa6'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { MdError } from 'react-icons/md'
import { Button } from 'src/components/Button'
import { Address } from 'viem'

type DeleteConfirmationProps = BaseOverlayProps & {
    onConfirm: () => void
    onCancel: () => void
    error?: any
    isLoading: boolean
    isSuccess: boolean
    isPending: boolean
    bucketToDelete: StakeBucket | null
    selectedBucketId: Address | null
    buckets: StakeBucket[]
    onBucketSelection: (bucketId: Address) => void
}

export const DeleteConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    isLoading,
    isSuccess,
    isPending,
    error,
    bucketToDelete,
    selectedBucketId,
    buckets,
    onBucketSelection,
}: DeleteConfirmationProps) => {
    const showSuccessMessage = !error && !isLoading && isSuccess
    const showSpinner = !error && isLoading && !isSuccess
    const showContent = !error && !isLoading && !isSuccess
    const showError = !!error && !isLoading && !isSuccess

    return (
        bucketToDelete && (
            <BaseOverlay isOpen={isOpen} closeOnBackdropClick={false} onClose={() => {}}>
                {showSuccessMessage && (
                    <div>
                        <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                            <IoCheckmarkCircle className="size-[100px] text-success" />
                            <span className="font-bold">Successfully removed a staking pool</span>
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
                        <div className="text-3xl font-bold">Delete Staking Pool</div>
                        <div>
                            You&apos;re about to delete a staking pool with a share of {bucketToDelete.share / 100}%.
                        </div>
                        <RadioGroup
                            value={selectedBucketId}
                            onChange={onBucketSelection}
                            className="flex flex-col gap-4"
                        >
                            <div>
                                Please select a staking pool <br />
                                that should overtake this {bucketToDelete.share / 100}%:
                            </div>
                            {buckets
                                .filter((bucket) => bucket.id !== bucketToDelete.id)
                                .map((bucket) => (
                                    <Field key={bucket.id} className="flex w-full items-center ">
                                        <Radio
                                            value={bucket.id}
                                            className="group relative flex w-full cursor-pointer rounded-lg bg-dapp-blue-400 p-4 text-white shadow-md transition focus:outline-none data-[checked]:bg-dapp-blue-200 data-[focus]:outline-1 data-[focus]:outline-dapp-blue-50"
                                        >
                                            <div className="flex w-full flex-row items-center justify-between gap-4">
                                                <p className="flex-1 text-white">
                                                    {bucket.burn ? (
                                                        <span className="font-bold text-degenOrange">BURNED</span>
                                                    ) : Boolean(bucket.duration) ? (
                                                        durationFromSeconds(Number(bucket.duration), {
                                                            long: true,
                                                        })
                                                    ) : (
                                                        'Standard'
                                                    )}
                                                    <br />
                                                    <div className="text-sm">
                                                        <span>Share: {bucket.share / 100}%</span>
                                                        {bucket.id === selectedBucketId && (
                                                            <span className="text-dapp-cyan-500">{`(+${
                                                                bucketToDelete.share / 100
                                                            }% ⇢ ${
                                                                (bucket.share + bucketToDelete.share) / 100
                                                            }%)`}</span>
                                                        )}
                                                    </div>
                                                </p>
                                                <FaCircleCheck className="size-6 hidden fill-white transition group-data-[checked]:block" />
                                                <FaRegCircle className="size-6 block fill-white opacity-30 transition group-data-[checked]:hidden" />
                                            </div>
                                        </Radio>
                                    </Field>
                                ))}
                        </RadioGroup>
                        <div className="flex w-full flex-row-reverse gap-4">
                            <Button
                                disabled={!selectedBucketId}
                                variant="primary"
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
    )
}
