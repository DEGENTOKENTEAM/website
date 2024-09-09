import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useGetFeeFor } from '@dapphooks/staking/useGetFee'
import { useGetFeeMax } from '@dapphooks/staking/useGetFeeMax'
import { useUpdateFeesForStaking } from '@dapphooks/staking/useUpdateFeesForStaking'
import { BigIntUpDown } from '@dappshared/BigIntUpDown'
import { CaretDivider } from '@dappshared/CaretDivider'
import { Tile } from '@dappshared/Tile'
import { useCallback, useContext, useEffect, useState } from 'react'
import { FaPen } from 'react-icons/fa'
import { Button } from 'src/components/Button'
import { ApplyChangesConfirmation } from './fees/overlays/ApplyChangesConfirmation'

export const Fees = () => {
    const {
        data: { protocol, isOwner, chain },
    } = useContext(ManageStakeXContext)

    const [isEditMode, setIsEditMode] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [isApplyChangesModalOpen, setIsApplyChangesModalOpen] = useState(false)

    const [stakingFee, setStakingFee] = useState(0n)
    const [restakingFee, setRestakingFee] = useState(0n)
    const [withdrawFee, setWithdrawFee] = useState(0n)
    const [stakingFeeOrig, setStakingFeeOrig] = useState(0n)
    const [restakingFeeOrig, setRestakingFeeOrig] = useState(0n)
    const [withdrawFeeOrig, setWithdrawFeeOrig] = useState(0n)

    const { data: dataGetFeeMax } = useGetFeeMax(protocol, chain?.id!)
    const { data: dataFeeForStaking, refetch: refetchFeeForStaking } = useGetFeeFor(
        protocol,
        chain?.id!,
        'staking',
        10000n
    )
    const { data: dataFeeForRestaking, refetch: refetchFeeForRestaking } = useGetFeeFor(
        protocol,
        chain?.id!,
        'restaking',
        10000n
    )
    const { data: dataFeeForWithdraw, refetch: refetchFeeForWithdraw } = useGetFeeFor(
        protocol,
        chain?.id!,
        'unstaking',
        10000n
    )
    const {
        write: writeUpdateFeesForStaking,
        error: errorUpdateFeesForStaking,
        isSuccess: isSuccessUpdateFeesForStaking,
        isLoading: isLoadingUpdateFeesForStaking,
        isPending: isPendingUpdateFeesForStaking,
        reset: resetUpdateFeesForStaking,
    } = useUpdateFeesForStaking(protocol, chain?.id!, stakingFee, withdrawFee, restakingFee)

    const onClickChangeFees = () => {
        setIsEditMode(true)
        resetUpdateFeesForStaking()
    }

    const onClickCancel = () => {
        setStakingFee(stakingFeeOrig)
        setRestakingFee(restakingFeeOrig)
        setWithdrawFee(withdrawFeeOrig)
        setHasChanges(false)
        setIsEditMode(false)
        resetUpdateFeesForStaking()
    }

    const onClickApplyChanges = () => setIsApplyChangesModalOpen(true)

    const steps = 5n
    const onChangeStakingFee = (value: bigint) => setStakingFee(value)
    const onChangeRestakingFee = (value: bigint) => setRestakingFee(value)
    const onChangeWithdrawFee = (value: bigint) => setWithdrawFee(value)

    const onConfirmationModalClose = () => {
        setIsApplyChangesModalOpen(false)
        setHasChanges(false)
        setIsEditMode(false)
        refetchFeeForRestaking && refetchFeeForRestaking()
        refetchFeeForStaking && refetchFeeForStaking()
        refetchFeeForWithdraw && refetchFeeForWithdraw()
    }

    const onConfirmationModalOK = useCallback(() => {
        writeUpdateFeesForStaking && writeUpdateFeesForStaking()
    }, [writeUpdateFeesForStaking])

    const onConfirmationModalNOK = () => {
        setIsApplyChangesModalOpen(false)
    }

    useEffect(() => {
        if (!hasChanges) {
            if (dataFeeForStaking) {
                setStakingFee(dataFeeForStaking.feeAmount)
                setStakingFeeOrig(dataFeeForStaking.feeAmount)
            }

            if (dataFeeForRestaking) {
                setRestakingFee(dataFeeForRestaking.feeAmount)
                setRestakingFeeOrig(dataFeeForRestaking.feeAmount)
            }
            if (dataFeeForWithdraw) {
                setWithdrawFee(dataFeeForWithdraw.feeAmount)
                setWithdrawFeeOrig(dataFeeForWithdraw.feeAmount)
            }
        }
    }, [hasChanges, dataFeeForStaking, dataFeeForRestaking, dataFeeForWithdraw])

    useEffect(
        () =>
            setHasChanges(
                stakingFee != stakingFeeOrig || restakingFee != restakingFeeOrig || withdrawFee != withdrawFeeOrig
            ),
        [stakingFee, restakingFee, withdrawFee, restakingFeeOrig, stakingFeeOrig, withdrawFeeOrig]
    )

    return (
        <>
            <Tile className="w-full">
                <div className="flex flex-col md:items-center gap-4 md:flex-row">
                    <span className="flex-1 font-title text-xl font-bold">
                        {isOwner ? `Protocol Fee Management` : `Protocol Fees`}
                    </span>
                    {isOwner &&
                        (isEditMode ? (
                            <div className="flex flex-row w-full md:w-auto gap-4">
                                <Button
                                    variant="primary"
                                    disabled={!hasChanges}
                                    onClick={onClickApplyChanges}
                                    className="flex-grow gap-3"
                                >
                                    <span>Apply Changes</span>
                                </Button>
                                <Button variant="secondary" onClick={onClickCancel} className="gap-3">
                                    <span>Cancel</span>
                                </Button>
                            </div>
                        ) : (
                            <Button variant="primary" onClick={onClickChangeFees} className="gap-3">
                                <FaPen /> <span>Change Fees</span>
                            </Button>
                        ))}
                </div>
                <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
                    <div className="flex flex-col gap-1 rounded-lg bg-dapp-blue-400 p-3">
                        <div>Deposit Fee %</div>
                        <CaretDivider />
                        <BigIntUpDown
                            min={0n}
                            max={dataGetFeeMax || 0n}
                            step={steps}
                            value={stakingFee}
                            decimals={2n}
                            hideControls={!isEditMode}
                            onChange={onChangeStakingFee}
                        />
                    </div>
                    <div className="flex flex-col gap-1 rounded-lg bg-dapp-blue-400 p-3">
                        <div>Restake Fee %</div>
                        <CaretDivider />
                        <BigIntUpDown
                            min={0n}
                            max={dataGetFeeMax || 0n}
                            step={steps}
                            value={restakingFee}
                            decimals={2n}
                            hideControls={!isEditMode}
                            onChange={onChangeRestakingFee}
                        />
                    </div>
                    <div className="flex flex-col gap-1 rounded-lg bg-dapp-blue-400 p-3">
                        <div>Withdraw Fee %</div>
                        <CaretDivider />
                        <BigIntUpDown
                            min={0n}
                            max={dataGetFeeMax || 0n}
                            step={steps}
                            value={withdrawFee}
                            decimals={2n}
                            hideControls={!isEditMode}
                            onChange={onChangeWithdrawFee}
                        />
                    </div>
                </div>
            </Tile>
            <ApplyChangesConfirmation
                isLoading={isLoadingUpdateFeesForStaking}
                isSuccess={isSuccessUpdateFeesForStaking}
                isPending={isPendingUpdateFeesForStaking}
                isOpen={isApplyChangesModalOpen}
                onClose={() => onConfirmationModalClose()}
                onConfirm={() => onConfirmationModalOK()}
                onCancel={() => onConfirmationModalNOK()}
                error={errorUpdateFeesForStaking}
            />
        </>
    )
}
