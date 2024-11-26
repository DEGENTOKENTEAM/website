import { Spinner } from '@dappelements/Spinner'
import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useStakeXUpdater } from '@dapphooks/shared/useStakeXUpdater'
import { useUpgraderGetVersion } from '@dapphooks/staking/useUpgraderGetVersion'
import { useUpgraderUpgrade } from '@dapphooks/staking/useUpgraderUpgrade'
import { useVersion } from '@dapphooks/staking/useVersion'
import { isUndefined, toLower } from 'lodash'
import { useCallback, useContext, useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { Button } from 'src/components/Button'
import { useSendTransaction } from 'wagmi'
import { ApplyChangesConfirmation } from './update/overlays/ApplyChangesConfirmation'

export const VersionInformation = () => {
    const {
        reloadData,
        data: { protocol, chain, canEdit },
    } = useContext(ManageStakeXContext)

    ///
    /// Version
    ///
    const {
        data,
        isError: isErrorGetVersion,
        isLoading: isLoadingGetVersion,
        refetch: refetchGetVersion,
    } = useUpgraderGetVersion(protocol, chain?.id!)
    const {
        isError: isErrorVersion,
        isLoading: isLoadingVersion,
        refetch: refetchVersion,
    } = useVersion(protocol, chain?.id!)

    ///
    /// Upgrade
    ///
    const [isApplyChangesModalOpen, setIsApplyChangesModalOpen] = useState(false)
    const {
        write,
        reset: resetUpgrade,
        error: errorUpgrade,
        isLoading: isLoadingUpgrade,
        isSuccess: isSuccessUpgrade,
        isPending: isPendingUpgrade,
    } = useUpgraderUpgrade(protocol, chain?.id!)

    const onClickHandler = () => {
        resetUpgrade()
        setIsApplyChangesModalOpen(true)
    }

    const onConfirmationModalClose = useCallback(() => {
        refetchGetVersion && refetchGetVersion()
        setIsApplyChangesModalOpen(false)
    }, [refetchGetVersion])

    const onConfirmationModalOK = useCallback(() => {
        write && write()
    }, [write])

    const onConfirmationModalNOK = () => {
        setIsApplyChangesModalOpen(false)
    }

    ///
    /// upgrade
    ///
    const {
        response: responseUpdater,
        loading: isLoadingUpdater,
        refetch: refetchUpdataer,
    } = useStakeXUpdater(protocol, chain?.id!)
    const {
        sendTransaction,
        isPending: isPendingTransaction,
        isSuccess: isSuccessTransaction,
        isError: isErrorTransaction,
        error: errorTransaction,
        reset: resetTransaction,
    } = useSendTransaction()

    const onClickUpdate = useCallback(() => {
        if (!isPendingTransaction && !isLoadingUpdater && responseUpdater && sendTransaction)
            sendTransaction({
                to: protocol,
                data: responseUpdater.upgradeData.updateCalldata,
            })
    }, [isPendingTransaction, protocol, responseUpdater, isLoadingUpdater, sendTransaction])

    const onClickCleanup = useCallback(() => {
        if (!isPendingTransaction && !isLoadingUpdater && responseUpdater && sendTransaction)
            sendTransaction({
                to: protocol,
                data: responseUpdater.upgradeData.cleanupCalldata,
            })
    }, [isPendingTransaction, protocol, responseUpdater, isLoadingUpdater, sendTransaction])

    useEffect(() => {
        if (isSuccessTransaction) {
            resetTransaction && resetTransaction()

            refetchVersion && refetchVersion()
            refetchGetVersion && refetchGetVersion()

            reloadData && reloadData()

            toast.success('Successfully executed')
        }
    }, [isSuccessTransaction, refetchGetVersion, refetchVersion, resetTransaction, reloadData])

    if (!canEdit) return <></>

    if (
        (isErrorGetVersion || !isErrorVersion) &&
        !isLoadingVersion &&
        !isLoadingGetVersion &&
        (toLower(protocol) == toLower('0x1b8875b6326F493D576906DD8e133E86ff3A4993') ||
            toLower(protocol) == toLower('0xaACD403f938CAc72DCA84Caa52f712faA3b4e2AF'))
    )
        return (
            <span className="flex flex-row gap-4">
                {isErrorVersion ? (
                    <Button variant="primary" disabled={isPendingTransaction} onClick={onClickUpdate}>
                        Step 1: Update & Migrate
                    </Button>
                ) : (
                    <Button variant="primary" disabled={isPendingTransaction} onClick={onClickCleanup}>
                        Step 2: Cleanup
                    </Button>
                )}
            </span>
        )

    return (
        <>
            <span className="flex flex-row items-center justify-center gap-2">
                {(!isUndefined(data) || isLoadingGetVersion) && `Current Protocol Version:`}
                {isUndefined(data) && isLoadingGetVersion ? (
                    <span>
                        <Spinner theme="dark" className="!h-5 !w-5" />
                    </span>
                ) : data ? (
                    <>
                        <span>
                            v{data.current.major}.{data.current.minor}.{data.current.patch}
                        </span>
                        {data.updateAvailable && (
                            <span>
                                {' '}
                                (
                                <span className="cursor-pointer text-dapp-cyan-500 underline" onClick={onClickHandler}>
                                    update now
                                </span>
                                )
                            </span>
                        )}
                    </>
                ) : (
                    <span>Up-to-date</span>
                )}
            </span>
            {canEdit && (
                <>
                    {isApplyChangesModalOpen && (
                        <ApplyChangesConfirmation
                            isLoading={isLoadingUpgrade}
                            isOpen={isApplyChangesModalOpen}
                            isSuccess={isSuccessUpgrade}
                            isPending={isPendingUpgrade}
                            onConfirm={() => onConfirmationModalOK()}
                            onClose={() => onConfirmationModalClose()}
                            onCancel={() => onConfirmationModalNOK()}
                            error={errorUpgrade}
                        />
                    )}
                </>
            )}
            <ToastContainer />
        </>
    )
}
