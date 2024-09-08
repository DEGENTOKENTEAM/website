import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useHasUpdateAvailable } from '@dapphooks/staking/useHasUpdateAvailable'
import { useUpdateProtocol } from '@dapphooks/staking/useUpdateProtocol'
import { Tile } from '@dappshared/Tile'
import { useCallback, useContext, useState } from 'react'
import { Button } from 'src/components/Button'
import { ApplyChangesConfirmation } from './update/overlays/ApplyChangesConfirmation'

export const UpdateAvailability = () => {
    const {
        data: { protocol, chain },
    } = useContext(ManageStakeXContext)

    const [isApplyChangesModalOpen, setIsApplyChangesModalOpen] = useState(false)
    const { loading, response, refetch } = useHasUpdateAvailable({
        protocol,
        chainId: chain?.id!,
        enabled: Boolean(chain && chain.id && protocol),
    })

    const { write, reset, isLoading, isPending, isSuccess, error, isError, isEnabled } = useUpdateProtocol(
        chain?.id!,
        protocol,
        response?.updates,
        Boolean(
            chain && chain.id && protocol && !loading && response && response.updates && response.updates.length > 0
        )
    )

    const onClickHandler = () => {
        reset()
        setIsApplyChangesModalOpen(true)
    }

    const onConfirmationModalClose = useCallback(() => {
        refetch && refetch()
        setIsApplyChangesModalOpen(false)
    }, [refetch])

    const onConfirmationModalOK = useCallback(() => {
        write && write()
    }, [write])

    const onConfirmationModalNOK = () => {
        setIsApplyChangesModalOpen(false)
    }

    if (!isEnabled) return <></>

    return (
        <>
            <Tile className="flex w-full flex-row items-center  justify-center gap-4 ">
                <span className="flex-grow items-center font-title text-xl font-bold">Update available</span>
                <div>
                    <Button variant="primary" onClick={() => onClickHandler()}>
                        Update now
                    </Button>
                </div>
            </Tile>
            <ApplyChangesConfirmation
                isLoading={isLoading}
                isOpen={isApplyChangesModalOpen}
                isSuccess={isSuccess}
                isPending={isPending}
                onConfirm={() => onConfirmationModalOK()}
                onClose={() => onConfirmationModalClose()}
                onCancel={() => onConfirmationModalNOK()}
                error={error}
            />
        </>
    )
}
