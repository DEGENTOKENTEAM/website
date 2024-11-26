import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useEnableMerging } from '@dapphooks/staking/useEnableMerging'
import { useGetFeeMax } from '@dapphooks/staking/useGetFeeMax'
import { useGetMergeFee } from '@dapphooks/staking/useGetMergeFee'
import { useMergeActive } from '@dapphooks/staking/useMergeActive'
import { useUpdateFeeForMerging } from '@dapphooks/staking/useUpdateFeeForMerging'
import { BigIntUpDown } from '@dappshared/BigIntUpDown'
import { CaretDivider } from '@dappshared/CaretDivider'
import { SwitchForm } from '@dappshared/SwitchForm'
import { Tile } from '@dappshared/Tile'
import clsx from 'clsx'
import { Tooltip } from 'flowbite-react'
import { isBoolean } from 'lodash'
import { useCallback, useContext, useEffect, useState } from 'react'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { FaPen } from 'react-icons/fa'
import { TbArrowMergeBoth } from 'react-icons/tb'
import { Button } from 'src/components/Button'
import { ApplyChangesConfirmation } from './merging/overlays/ApplyChangesConfirmation'
import { ToggleStatusConfirmation } from './merging/overlays/ToggleStatusConfirmation'

export const MergingManagement = () => {
    const {
        data: { protocol, chain, canEdit },
    } = useContext(ManageStakeXContext)

    const [isEditMode, setIsEditMode] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [isActive, setIsActive] = useState(false)
    const [isFeeChangeModalOpen, setIsFeeChangeModalOpen] = useState(false)
    const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false)

    const [fee, setFee] = useState(0n)
    const [feeOrig, setFeeOrig] = useState(0n)

    // readables
    const { data: dataMergeActive, refetch: refetchMergeActive } = useMergeActive(protocol, chain?.id!)
    const { data: dataGetFeeMax } = useGetFeeMax(protocol, chain?.id!)
    const { data: dataGetFee, refetch: refetchGetFee } = useGetMergeFee(protocol, chain?.id!)

    //
    // writables
    //
    const {
        write: writeEnableMerging,
        reset: resetEnableMerging,
        error: errorEnableMerging,
        isLoading: isLoadingEnableMerging,
        isSuccess: isSuccessEnableMerging,
        isPending: isPendingEnableMerging,
    } = useEnableMerging(
        protocol,
        chain?.id!,
        isActive,
        Boolean(protocol && chain && chain.id && isBoolean(dataMergeActive))
    )
    const {
        write: writeUpdateFee,
        reset: resetUpdateFee,
        error: errorUpdateFee,
        isLoading: isLoadingUpdateFee,
        isSuccess: isSuccessUpdateFee,
        isPending: isPendingUpdateFee,
    } = useUpdateFeeForMerging(protocol, chain?.id!, fee)

    //
    // change feature status
    //
    const refreshData = useCallback(() => {
        refetchMergeActive && refetchMergeActive()
        refetchGetFee && refetchGetFee()
    }, [refetchMergeActive, refetchGetFee])

    const onClickToggleMergingStatus = (status: boolean) => {
        setIsActive(status)
        resetEnableMerging()
        setIsToggleStatusModalOpen(true)
    }

    const onConfirmMergingStatusOK = useCallback(() => {
        writeEnableMerging && writeEnableMerging()
    }, [writeEnableMerging])

    const onConfirmMergingStatusNOK = () => {
        setIsToggleStatusModalOpen(false)
        setIsActive(!isActive)
    }

    const onConfirmMergingStatusClose = () => {
        refreshData()
        setIsToggleStatusModalOpen(false)
    }

    //
    // change fee amount
    //
    const onClickChangeFee = () => {
        setIsEditMode(true)
    }

    const onClickCancel = () => {
        setFee(feeOrig)
        setHasChanges(false)
        setIsEditMode(false)
    }

    const steps = 5n
    const onChangeFee = (value: bigint) => setFee(value)

    const onClickApplyChange = () => {
        resetUpdateFee()
        setIsFeeChangeModalOpen(true)
    }

    const onConfirmationModalClose = () => {
        setIsFeeChangeModalOpen(false)
        setHasChanges(false)
        setIsEditMode(false)
        refreshData()
    }

    const onConfirmationModalOK = useCallback(() => {
        writeUpdateFee && writeUpdateFee()
    }, [writeUpdateFee])

    const onConfirmationModalNOK = () => {
        setIsFeeChangeModalOpen(false)
    }

    useEffect(() => {
        if (!hasChanges && dataGetFee) {
            setFee(dataGetFee)
            setFeeOrig(dataGetFee)
        }
    }, [hasChanges, dataGetFee])

    useEffect(() => {
        setIsActive(Boolean(dataMergeActive))
    }, [dataMergeActive])

    useEffect(() => setHasChanges(fee != feeOrig), [fee, feeOrig])

    return (
        <>
            <Tile className="flex w-full flex-col gap-8">
                <div className="flex items-center gap-2 font-title text-xl font-bold">
                    <span>Merging {canEdit && 'Management'}</span>
                    <Tooltip
                        content={
                            <div className="font-display text-darkTextLowEmphasis">
                                <span className="font-bold text-dapp-cyan-50">Merging</span> is a feature available for{' '}
                                <span className="font-bold text-dapp-cyan-50">
                                    <span className="font-title">
                                        <span className="text-techGreen">STAKE</span>
                                        <span className="text-degenOrange">X</span>
                                    </span>{' '}
                                    Staking Solutions
                                </span>{' '}
                                that are offering more than one reward pool. It enables the stakers to merge stakes of
                                the same pool to one single stake with an updated lock period.
                            </div>
                        }
                        className="w-[500px] max-w-[90%] bg-dapp-blue-50"
                        placement="auto"
                    >
                        <AiOutlineQuestionCircle data-tooltip-target="tooltip-default" />
                    </Tooltip>
                </div>
                <div className="flex flex-row items-start gap-8">
                    <div className="flex grow flex-row items-center gap-8">
                        <TbArrowMergeBoth className={clsx([`size-8`, dataMergeActive && 'text-dapp-cyan-500'])} />
                        <span>Merging {dataMergeActive ? 'enabled' : 'disabled'}</span>
                    </div>
                    {canEdit && (
                        <div className="shrink-0">
                            <SwitchForm enabled={isActive} onChange={onClickToggleMergingStatus} />
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1 rounded-lg bg-dapp-blue-400 p-3">
                        <div>Merging Fee %</div>
                        <CaretDivider />
                        <BigIntUpDown
                            min={0n}
                            max={dataGetFeeMax || 0n}
                            step={steps}
                            value={fee}
                            decimals={2n}
                            hideControls={!isEditMode}
                            onChange={onChangeFee}
                        />
                    </div>
                    {canEdit &&
                        (isEditMode ? (
                            <div className="flex w-full flex-row gap-4 md:w-auto">
                                <Button
                                    variant="primary"
                                    disabled={!hasChanges}
                                    onClick={onClickApplyChange}
                                    className="grow gap-3"
                                >
                                    <span>Apply Changes</span>
                                </Button>
                                <Button variant="secondary" onClick={onClickCancel} className="gap-3">
                                    <span>Cancel</span>
                                </Button>
                            </div>
                        ) : (
                            <Button variant="primary" onClick={onClickChangeFee} className="gap-3">
                                <FaPen /> <span>Change Fee</span>
                            </Button>
                        ))}
                </div>
            </Tile>
            <ToggleStatusConfirmation
                isLoading={isLoadingEnableMerging}
                isSuccess={isSuccessEnableMerging}
                isPending={isPendingEnableMerging}
                isOpen={isToggleStatusModalOpen}
                onClose={() => onConfirmMergingStatusClose()}
                onConfirm={() => onConfirmMergingStatusOK()}
                onCancel={() => onConfirmMergingStatusNOK()}
                targetStatus={!dataMergeActive}
                error={errorEnableMerging}
            />
            <ApplyChangesConfirmation
                isLoading={isLoadingUpdateFee}
                isSuccess={isSuccessUpdateFee}
                isPending={isPendingUpdateFee}
                isOpen={isFeeChangeModalOpen}
                onClose={() => onConfirmationModalClose()}
                onConfirm={() => onConfirmationModalOK()}
                onCancel={() => onConfirmationModalNOK()}
                error={errorUpdateFee}
            />
        </>
    )
}
