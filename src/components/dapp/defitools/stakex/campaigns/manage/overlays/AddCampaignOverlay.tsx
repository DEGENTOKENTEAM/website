import { Spinner } from '@dappelements/Spinner'
import { BaseOverlay, BaseOverlayProps } from '@dappshared/overlays/BaseOverlay'
import { STAKEXManagementCreateCampaignParams, TokenInfoResponse } from '@dapptypes'
import { Field, Input, Label } from '@headlessui/react'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa6'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { Button } from 'src/components/Button'
import { formatUnits, parseUnits } from 'viem'

type AddCampaignOverlayProps = {
    rewardToken: TokenInfoResponse
    isFormValid: boolean
    isLoading: boolean
    isPending: boolean
    isSuccess: boolean
    onClickCreate: () => void
    formData: STAKEXManagementCreateCampaignParams
    setFormData: (data: STAKEXManagementCreateCampaignParams) => void
} & BaseOverlayProps

export const AddCampaignOverlay = ({
    formData,
    setFormData,
    rewardToken,
    isFormValid,
    isLoading,
    isPending,
    isSuccess,
    isOpen,
    onClickCreate,
    onClose,
}: AddCampaignOverlayProps) => {
    ///
    /// Campaign Name
    ///
    const [campaignNameEntered, setCampaignNameEntered] = useState<string>(formData.name)
    const onChangeCampaignName = (_event: ChangeEvent<HTMLInputElement>) => {
        _event.preventDefault()
        setCampaignNameEntered(_event.target.value)
    }
    useEffect(() => setFormData({ ...formData, name: campaignNameEntered || '' }), [campaignNameEntered])

    ///
    /// Reward Amount
    ///
    const rewardAmountRef = useRef<HTMLInputElement>(null)
    const [rewardAmountEntered, setRewardAmountEntered] = useState<string>(
        formData && formData.bucketId ? formatUnits(formData.rewardAmount, Number(rewardToken.decimals)) : ''
    )

    const onChangeRewardAmount = (_event: ChangeEvent<HTMLInputElement>) => {
        _event.preventDefault()
        setRewardAmountEntered(_event.target.value)
    }

    useEffect(() => {
        if (Boolean(rewardAmountEntered)) {
            const cleanRewardAmountEntered = (Number(rewardAmountEntered) * 1).toString()
            const rewardAmountEnteredBN = parseUnits(cleanRewardAmountEntered, Number(rewardToken.decimals))
            const checkRewardAmountEntered = formatUnits(rewardAmountEnteredBN, Number(rewardToken.decimals))

            if (cleanRewardAmountEntered != checkRewardAmountEntered) {
                setFormData({ ...formData, rewardAmount: 0n })
                return
            }
            setFormData({ ...formData, rewardAmount: rewardAmountEnteredBN })
        }

        if (!rewardAmountEntered) {
            setFormData({ ...formData, rewardAmount: 0n })
        }
    }, [rewardAmountEntered])

    ///
    /// Duration
    ///
    const durationRef = useRef<HTMLInputElement>(null)
    const [durationEntered, setDurationEntered] = useState<string>(
        formData.bucketId ? String(Number(formData.period) / 86400) : ''
    )
    const onChangeDuration = (_event: ChangeEvent<HTMLInputElement>) => {
        _event.preventDefault()
        setDurationEntered(_event.target.value)
    }

    useEffect(() => {
        if (Boolean(durationEntered)) setFormData({ ...formData, period: Number(durationEntered) * 86400 })
        if (!durationEntered) setFormData({ ...formData, period: 0 })
    }, [durationEntered])

    ///
    /// Initialize
    ///

    const onCloseHandler = () => {
        setCampaignNameEntered('')
        setRewardAmountEntered('')
        setDurationEntered('')
        onClose && onClose()
    }

    return (
        <BaseOverlay isOpen={isOpen} closeOnBackdropClick={false} onClose={onCloseHandler}>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-6 text-base">
                    <h3 className="flex flex-row items-center gap-3 text-xl">
                        <div className="font-title">Create New Campaign</div>
                        <div>{/* <AiOutlineQuestionCircle /> */}</div>
                        <div className="flex grow justify-end">
                            <button
                                type="button"
                                className="flex items-center justify-end gap-1 text-xs"
                                onClick={onCloseHandler}
                            >
                                <FaArrowLeft className="size-3" />
                                Back
                            </button>
                        </div>
                    </h3>
                </div>
                <div className="relative flex flex-col gap-6">
                    <Field className="flex flex-col">
                        <Label className="mx-2">Campaign Name</Label>
                        <Input
                            placeholder="Enter campaign name..."
                            autoComplete="off"
                            onChange={onChangeCampaignName}
                            name="full_name"
                            className="mt-2 w-full rounded-lg border-0 bg-dapp-blue-800 p-2 text-2xl leading-10 outline-0 [appearance:textfield] focus:ring-0 focus:ring-offset-0"
                        />
                    </Field>
                    <Field className="flex flex-col">
                        <Label className="mx-2">{rewardToken.symbol} Reward Amount</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={rewardAmountEntered}
                            autoComplete="off"
                            onChange={onChangeRewardAmount}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="mt-2 w-full rounded-lg border-0 bg-dapp-blue-800 text-left text-2xl leading-10 [appearance:textfield] focus:ring-0 focus:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            ref={rewardAmountRef}
                        />
                    </Field>
                    <Field className="flex flex-col">
                        <Label className="mx-2">Campaign Duration (in days)</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={durationEntered}
                            autoComplete="off"
                            onChange={onChangeDuration}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="mt-2 w-full rounded-lg border-0 bg-dapp-blue-800 text-left text-2xl leading-10 [appearance:textfield] focus:ring-0 focus:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            ref={durationRef}
                        />
                    </Field>
                    {!isSuccess && (isLoading || isPending) && (
                        <div className="absolute -inset-2 flex flex-col items-center justify-center gap-4 rounded-xl bg-dapp-blue-600/90">
                            <Spinner theme="dark" className="!h-24 !w-24" />
                            {isPending ? (
                                <span className="text-center">
                                    Open your wallet <br />
                                    and confirm the transaction
                                </span>
                            ) : (
                                <span className="text-center">Waiting for your transaction to be processed</span>
                            )}
                        </div>
                    )}

                    {isSuccess && (
                        <>
                            <div className="absolute -inset-2 flex flex-col items-center justify-center gap-4 rounded-xl bg-dapp-blue-600/90">
                                <IoCheckmarkCircle className="size-[100px] text-success" />
                                <span>Successfully created campaign</span>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex flex-row gap-4">
                    {!isSuccess && !isLoading && !isPending && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={onCloseHandler}
                                className="flex w-full items-center justify-center gap-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                disabled={!isFormValid}
                                onClick={onClickCreate}
                                className="flex w-full items-center justify-center gap-2"
                            >
                                Create now
                            </Button>
                        </>
                    )}
                    {isSuccess && (
                        <Button
                            variant="primary"
                            onClick={onCloseHandler}
                            className="mt-2 flex w-full items-center justify-center gap-2"
                        >
                            Close
                        </Button>
                    )}
                </div>
            </div>
        </BaseOverlay>
    )
}
