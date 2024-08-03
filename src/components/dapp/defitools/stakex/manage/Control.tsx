import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useActive } from '@dapphooks/staking/useActive'
import { useEnableProtocol } from '@dapphooks/staking/useEnableProtocol'
import { Tile } from '@dappshared/Tile'
import { isBoolean } from 'lodash'
import { useCallback, useContext, useEffect, useState } from 'react'
import { Button } from 'src/components/Button'
import { DisableProtocolConfirmation } from './control/overlays/DisableProtocolConfirmation'

export const Control = () => {
    const {
        data: { protocol, chain },
    } = useContext(ManageStakeXContext)

    const [isActive, setIsActive] = useState<boolean | null>(null)
    const [isApplyChangesModalOpen, setIsApplyChangesModalOpen] =
        useState(false)

    const { data: dataIsActive, refetch: refetchIsActive } = useActive(protocol)
    const { error, isLoading, isPending, isSuccess, reset, write } =
        useEnableProtocol(protocol, chain?.id!, !isActive!)

    const onClickToggleProtocolStatus = () => {
        reset()
        setIsApplyChangesModalOpen(true)
    }

    const onConfirmationModalOK = () => {
        write && write()
    }

    const onConfirmationModalNOK = () => {
        setIsApplyChangesModalOpen(false)
    }

    const onConfirmationModalClose = () => {
        refetchIsActive && refetchIsActive()
        setIsApplyChangesModalOpen(false)
    }

    useEffect(() => {
        isBoolean(dataIsActive) && setIsActive(dataIsActive)
    }, [dataIsActive])

    return (
        <>
            <Tile className="w-full">
                <div className="flex flex-row items-center">
                    <span className="flex-1 font-title text-xl font-bold">
                        Control
                    </span>
                </div>
                <div className="mt-8 flex gap-4">
                    <Button
                        onClick={onClickToggleProtocolStatus}
                        variant={isActive ? 'error' : 'primary'}
                    >
                        {isActive ? 'Disable' : 'Enable'} Protocol
                    </Button>
                </div>
            </Tile>
            <DisableProtocolConfirmation
                isLoading={isLoading}
                isSuccess={isSuccess}
                isPending={isPending}
                isOpen={isApplyChangesModalOpen}
                onClose={() => onConfirmationModalClose()}
                onConfirm={() => onConfirmationModalOK()}
                onCancel={() => onConfirmationModalNOK()}
                error={error}
            />
        </>
    )
}
