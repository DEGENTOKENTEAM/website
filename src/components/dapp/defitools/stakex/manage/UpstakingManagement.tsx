import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useEnableUpstaking } from '@dapphooks/staking/useEnableUpstaking'
import { useGetFeeMax } from '@dapphooks/staking/useGetFeeMax'
import { useGetUpstakeFee } from '@dapphooks/staking/useGetUpstakeFee'
import { useUpdateFeeForUpstaking } from '@dapphooks/staking/useUpdateFeeForUpstaking'
import { useUpstakeActive } from '@dapphooks/staking/useUpstakeActive'
import { BigIntUpDown } from '@dappshared/BigIntUpDown'
import { CaretDivider } from '@dappshared/CaretDivider'
import { SwitchForm } from '@dappshared/SwitchForm'
import { Tile } from '@dappshared/Tile'
import clsx from 'clsx'
import { Tooltip } from 'flowbite-react'
import { isBoolean } from 'lodash'
import { useCallback, useContext, useEffect, useState } from 'react'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { FaAngleDoubleUp, FaPen } from 'react-icons/fa'
import { Button } from 'src/components/Button'
import { ApplyChangesConfirmation } from './upstaking/overlays/ApplyChangesConfirmation'
import { ToggleStatusConfirmation } from './upstaking/overlays/ToggleStatusConfirmation'

export const UpstakingManagement = () => {
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
    const { data: dataUpstakeActive, refetch: refetchUpstakeActive } = useUpstakeActive(protocol, chain?.id!)
    const { data: dataGetFeeMax } = useGetFeeMax(protocol, chain?.id!)
    const { data: dataGetFee, refetch: refetchGetFee } = useGetUpstakeFee(protocol, chain?.id!)

    //
    // writables
    //
    const {
        write: writeEnableUpstaking,
        reset: resetEnableUpstaking,
        error: errorEnableUpstaking,
        isLoading: isLoadingEnableUpstaking,
        isSuccess: isSuccessEnableUpstaking,
        isPending: isPendingEnableUpstaking,
    } = useEnableUpstaking(
        protocol,
        chain?.id!,
        isActive,
        Boolean(protocol && chain && chain.id && isBoolean(dataUpstakeActive))
    )
    const {
        write: writeUpdateFee,
        reset: resetUpdateFee,
        error: errorUpdateFee,
        isLoading: isLoadingUpdateFee,
        isSuccess: isSuccessUpdateFee,
        isPending: isPendingUpdateFee,
    } = useUpdateFeeForUpstaking(protocol, chain?.id!, fee)

    //
    // change feature status
    //
    const refreshData = useCallback(() => {
        refetchUpstakeActive && refetchUpstakeActive()
        refetchGetFee && refetchGetFee()
    }, [refetchUpstakeActive, refetchGetFee])

    const onClickToggleUpstakingStatus = (status: boolean) => {
        setIsActive(status)
        resetEnableUpstaking()
        setIsToggleStatusModalOpen(true)
    }

    const onConfirmUpstakingStatusOK = useCallback(() => {
        writeEnableUpstaking && writeEnableUpstaking()
    }, [writeEnableUpstaking])

    const onConfirmUpstakingStatusNOK = () => {
        setIsToggleStatusModalOpen(false)
        setIsActive(!isActive)
    }

    const onConfirmUpstakingStatusClose = () => {
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
        setIsActive(Boolean(dataUpstakeActive))
    }, [dataUpstakeActive])

    useEffect(() => setHasChanges(fee != feeOrig), [fee, feeOrig])

    return (
        <>
            <Tile className="flex w-full flex-col gap-8">
                <div className="flex items-center gap-2 font-title text-xl font-bold">
                    <span>Upstaking {canEdit && 'Management'}</span>
                    <Tooltip
                        content={
                            <div className="font-display text-darkTextLowEmphasis">
                                <span className="font-bold text-dapp-cyan-50">Upstaking</span> is a feature available
                                for{' '}
                                <span className="font-bold text-dapp-cyan-50">
                                    <span className="font-title">
                                        <span className="text-techGreen">STAKE</span>
                                        <span className="text-degenOrange">X</span>
                                    </span>{' '}
                                    Staking Solutions
                                </span>{' '}
                                that are offering more than one reward pool with different locking periods. It enables
                                the stakers to upgrade their stake to join a pool that has a higher lock period than the
                                pool they are in right now.
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
                        <FaAngleDoubleUp className={clsx([`size-8`, dataUpstakeActive && 'text-dapp-cyan-500'])} />
                        <span>Upstaking {dataUpstakeActive ? 'enabled' : 'disabled'}</span>
                    </div>
                    {canEdit && (
                        <div className="shrink-0">
                            <SwitchForm enabled={isActive} onChange={onClickToggleUpstakingStatus} />
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1 rounded-lg bg-dapp-blue-400 p-3">
                        <div>Upstaking Fee %</div>
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
                isLoading={isLoadingEnableUpstaking}
                isSuccess={isSuccessEnableUpstaking}
                isPending={isPendingEnableUpstaking}
                isOpen={isToggleStatusModalOpen}
                onClose={() => onConfirmUpstakingStatusClose()}
                onConfirm={() => onConfirmUpstakingStatusOK()}
                onCancel={() => onConfirmUpstakingStatusNOK()}
                targetStatus={!dataUpstakeActive}
                error={errorEnableUpstaking}
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
