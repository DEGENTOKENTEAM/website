import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useAddingUpActive } from '@dapphooks/staking/useAddingUpActive'
import { useEnableAddingUp } from '@dapphooks/staking/useEnableAddingUp'
import { SwitchForm } from '@dappshared/SwitchForm'
import { Tile } from '@dappshared/Tile'
import clsx from 'clsx'
import { Tooltip } from 'flowbite-react'
import { isBoolean } from 'lodash'
import { useCallback, useContext, useEffect, useState } from 'react'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { BiAddToQueue } from 'react-icons/bi'
import { ToggleStatusConfirmation } from './addingup/overlays/ToggleStatusConfirmation'

export const AddingUpManagement = () => {
    const {
        data: { protocol, chain, canEdit },
    } = useContext(ManageStakeXContext)

    const [isActive, setIsActive] = useState(false)
    const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false)

    // readables
    const { data: dataAddingUpActive, refetch: refetchAddingUpActive } = useAddingUpActive(protocol, chain?.id!)

    //
    // writables
    //
    const {
        write: writeEnableAddingUp,
        reset: resetEnableAddingUp,
        error: errorEnableAddingUp,
        isLoading: isLoadingEnableAddingUp,
        isSuccess: isSuccessEnableAddingUp,
        isPending: isPendingEnableAddingUp,
    } = useEnableAddingUp(
        protocol,
        chain?.id!,
        isActive,
        Boolean(protocol && chain && chain.id && isBoolean(dataAddingUpActive))
    )
    //
    // change feature status
    //
    const refreshData = useCallback(() => {
        refetchAddingUpActive && refetchAddingUpActive()
    }, [refetchAddingUpActive])

    const onClickToggleMergingStatus = (status: boolean) => {
        setIsActive(status)
        resetEnableAddingUp()
        setIsToggleStatusModalOpen(true)
    }

    const onConfirmMergingStatusOK = useCallback(() => {
        writeEnableAddingUp && writeEnableAddingUp()
    }, [writeEnableAddingUp])

    const onConfirmMergingStatusNOK = () => {
        setIsToggleStatusModalOpen(false)
        setIsActive(!isActive)
    }

    const onConfirmMergingStatusClose = () => {
        refreshData()
        setIsToggleStatusModalOpen(false)
    }

    useEffect(() => {
        setIsActive(Boolean(dataAddingUpActive))
    }, [dataAddingUpActive])

    return (
        <>
            <Tile className="flex w-full flex-col gap-8">
                <div className="flex items-center gap-2 font-title text-xl font-bold">
                    <span>Adding Up {canEdit && 'Management'}</span>
                    <Tooltip
                        content={
                            <div className="font-display text-darkTextLowEmphasis">
                                <span className="font-bold text-dapp-cyan-50">Adding up</span> is a feature available
                                for{' '}
                                <span className="font-bold text-dapp-cyan-50">
                                    <span className="font-title">
                                        <span className="text-techGreen">STAKE</span>
                                        <span className="text-degenOrange">X</span>
                                    </span>{' '}
                                    Staking Solutions
                                </span>{' '}
                                that want enable their stakers to continuously adding their tokens up to a single stake.
                                While adding up, the lock period - if set - will be renewed on each stake deposit.
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
                        <BiAddToQueue className={clsx([`size-8`, dataAddingUpActive && 'text-dapp-cyan-500'])} />
                        <span>Adding up is {dataAddingUpActive ? 'enabled' : 'disabled'}</span>
                    </div>
                    {canEdit && (
                        <div className="shrink-0">
                            <SwitchForm enabled={isActive} onChange={onClickToggleMergingStatus} />
                        </div>
                    )}
                </div>
            </Tile>
            <ToggleStatusConfirmation
                isLoading={isLoadingEnableAddingUp}
                isSuccess={isSuccessEnableAddingUp}
                isPending={isPendingEnableAddingUp}
                isOpen={isToggleStatusModalOpen}
                onClose={() => onConfirmMergingStatusClose()}
                onConfirm={() => onConfirmMergingStatusOK()}
                onCancel={() => onConfirmMergingStatusNOK()}
                targetStatus={!dataAddingUpActive}
                error={errorEnableAddingUp}
            />
        </>
    )
}
