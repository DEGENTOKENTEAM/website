import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useActive } from '@dapphooks/staking/useActive'
import { useEnableProtocol } from '@dapphooks/staking/useEnableProtocol'
import { useEnableProtocolByBlock } from '@dapphooks/staking/useEnableProtocolByBlock'
import { useEnableProtocolByTime } from '@dapphooks/staking/useEnableProtocolByTime'
import { useGetActivationBlock } from '@dapphooks/staking/useGetActivationBlock'
import { useGetActivationTime } from '@dapphooks/staking/useGetActivationTime'
import { useNFTGetConfigs } from '@dapphooks/staking/useNFTGetConfigs'
import { CaretDivider } from '@dappshared/CaretDivider'
import { Tile } from '@dappshared/Tile'
import clsx from 'clsx'
import TimeAgo from 'javascript-time-ago'
import { isBoolean, isUndefined } from 'lodash'
import { useContext, useEffect, useState } from 'react'
import { FaCheckDouble, FaCubes, FaRegClock } from 'react-icons/fa'
import { MdLockOutline } from 'react-icons/md'
import { Button } from 'src/components/Button'
import { useBlock } from 'wagmi'
import { BlockNumberActivation } from './control/overlays/BlockNumberActivation'
import { BlockNumberDeactivationConfirmation } from './control/overlays/BlockNumberDeactivationConfirmation'
import { BlockTimeActivation } from './control/overlays/BlockTimeActivation'
import { BlockTimeDeactivationConfirmation } from './control/overlays/BlockTimeDeactivationConfirmation'
import { DisableProtocolConfirmation } from './control/overlays/DisableProtocolConfirmation'

export const Control = () => {
    const {
        data: { protocol, chain, canEdit },
    } = useContext(ManageStakeXContext)

    const timeAgo = new TimeAgo(navigator.language)

    const [isActive, setIsActive] = useState<boolean | null>(null)
    const [canActivate, setCanActivate] = useState(false)
    const [isApplyChangesModalOpen, setIsApplyChangesModalOpen] = useState(false)
    const [isBlockNumberActivationModalOpen, setIsBlockNumberActivationModalOpen] = useState(false)
    const [isBlockNumberDeactivationModalOpen, setIsBlockNumberDeactivationModalOpen] = useState(false)
    const [isBlockTimeActivationModalOpen, setIsBlockTimeActivationModalOpen] = useState(false)
    const [isBlockTimeDeactivationModalOpen, setIsBlockTimeDeactivationModalOpen] = useState(false)
    const [activationBlock, setActivationBlock] = useState<bigint>()
    const [activationTime, setActivationTime] = useState<bigint>()

    const { data: dataNFTConfigs, refetch: refetchNFTConfigs } = useNFTGetConfigs(protocol, chain?.id!)
    const { data: dataIsActive, refetch: refetchIsActive } = useActive(protocol, chain?.id!)
    const { data: currentActivationBlock, refetch: refetchActivationBlock } = useGetActivationBlock(
        protocol,
        chain?.id!
    )
    const { data: currentActivationTime, refetch: refetchActivationTime } = useGetActivationTime(protocol, chain?.id!)
    const { data: currentBlock } = useBlock({
        query: { enabled: Boolean(chain?.id) },
        chainId: chain?.id,
        watch: Boolean(currentActivationBlock && currentActivationBlock > 0n),
    })

    const { error, isLoading, isPending, isSuccess, reset, write } = useEnableProtocol(
        protocol,
        chain?.id!,
        !isActive!,
        canActivate
    )

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

    const {
        error: errorEnableByBlock,
        isError: isErrorEnableByBlock,
        isLoading: isLoadingEnableByBlock,
        isPending: isPendingEnableByBlock,
        isSuccess: isSuccessEnableByBlock,
        reset: resetEnableByBlock,
        write: writeEnableByBlock,
    } = useEnableProtocolByBlock(protocol, chain?.id!, activationBlock!, canActivate)

    const onClickBlockNumberActivation = () => {
        resetEnableByBlock()
        setIsBlockNumberActivationModalOpen(true)
    }
    const onClickBlockNumberRemoveActivation = () => {
        resetEnableByBlock()
        setActivationBlock(0n)
        setIsBlockNumberDeactivationModalOpen(true)
    }
    const onBlockNumberActivationModalOK = () => {
        writeEnableByBlock && writeEnableByBlock()
    }
    const onBlockNumberActivationModalNOK = () => {
        setIsBlockNumberActivationModalOpen(false)
        setIsBlockNumberDeactivationModalOpen(false)
    }
    const onBlockNumberActivationModalClose = () => {
        refetchActivationBlock && refetchActivationBlock()
        setIsBlockNumberActivationModalOpen(false)
        setIsBlockNumberDeactivationModalOpen(false)
    }

    const {
        error: errorEnableByTime,
        isError: isErrorEnableByTime,
        isLoading: isLoadingEnableByTime,
        isPending: isPendingEnableByTime,
        isSuccess: isSuccessEnableByTime,
        reset: resetEnableByTime,
        write: writeEnableByTime,
    } = useEnableProtocolByTime(protocol, chain?.id!, activationTime!, canActivate)

    const onClickBlockTimeActivation = () => {
        resetEnableByTime()
        setIsBlockTimeActivationModalOpen(true)
    }
    const onClickBlockTimeRemoveActivation = () => {
        resetEnableByTime()
        setActivationTime(0n)
        setIsBlockTimeDeactivationModalOpen(true)
    }
    const onBlockTimeActivationModalOK = () => {
        writeEnableByTime && writeEnableByTime()
    }
    const onBlockTimeActivationModalNOK = () => {
        setIsBlockTimeActivationModalOpen(false)
        setIsBlockTimeDeactivationModalOpen(false)
    }
    const onBlockTimeActivationModalClose = () => {
        refetchActivationTime && refetchActivationTime()
        setIsBlockTimeActivationModalOpen(false)
        setIsBlockTimeDeactivationModalOpen(false)
    }

    useEffect(() => {
        isBoolean(dataIsActive) && setIsActive(dataIsActive)
        if (dataIsActive && refetchNFTConfigs) refetchNFTConfigs()
    }, [refetchNFTConfigs, dataIsActive])

    useEffect(() => {
        setCanActivate(Boolean(dataNFTConfigs && dataNFTConfigs.length > 0))
    }, [dataNFTConfigs])

    if (!canEdit) return <></>

    return (
        <>
            <Tile className="relative w-full">
                <div className="flex flex-row items-center">
                    <span className="flex-1 font-title text-xl font-bold">Access Management</span>
                </div>
                <div className="mt-8 flex flex-col gap-8">
                    <div
                        className={clsx([
                            `flex flex-col gap-4 md:flex-row md:gap-8`,
                            Boolean(currentActivationTime || isActive) && 'opacity-30',
                        ])}
                    >
                        <div className="flex flex-row items-center gap-8 md:flex-grow">
                            <FaCubes className="h-8 w-8" />{' '}
                            {Boolean(currentBlock) &&
                                (!Boolean(currentActivationBlock) ? (
                                    <span>Set a block number when the protocol should start</span>
                                ) : currentActivationBlock! < currentBlock?.number! ? (
                                    <span>
                                        Your protocol started on block{' '}
                                        <span className="font-bold">{currentActivationBlock?.toString()}</span>
                                    </span>
                                ) : (
                                    <span>
                                        Your protocol is about to start on block{' '}
                                        <span className="font-bold">{currentActivationBlock?.toString()}</span>
                                        <br />
                                        Blocks left for start:{' '}
                                        {(currentActivationBlock! - currentBlock?.number!).toString()}
                                        . <br />
                                        The current block is {currentBlock?.number.toString()}.
                                    </span>
                                ))}
                        </div>
                        {!Boolean(currentActivationBlock) ? (
                            <Button
                                disabled={Boolean(isActive) || Boolean(currentActivationTime) || !canActivate}
                                className="w-full md:w-auto"
                                onClick={onClickBlockNumberActivation}
                                variant={'primary'}
                            >
                                Set Activation Block
                            </Button>
                        ) : (
                            <Button
                                disabled={Boolean(isActive)}
                                className="w-full md:w-auto"
                                onClick={onClickBlockNumberRemoveActivation}
                                variant={'error'}
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                    <div
                        className={clsx([
                            `flex flex-col gap-4 md:flex-row md:gap-8`,
                            Boolean(currentActivationTime || isActive) && 'opacity-30',
                        ])}
                    >
                        <div className="flex flex-row items-center gap-8 md:flex-grow">
                            <FaRegClock className="h-8 w-8" />
                            {Boolean(currentBlock) &&
                                (!Boolean(currentActivationTime) ? (
                                    <span>Set a time when the protocol should start</span>
                                ) : (
                                    <span>
                                        Your protocol is about to start{' '}
                                        {timeAgo.format(Number(currentActivationTime) * 1000, {
                                            future: true,
                                            round: 'round',
                                            now: Number(currentBlock?.timestamp) * 1000,
                                        })}{' '}
                                        at{' '}
                                        <span className="font-bold">
                                            {Boolean(currentActivationTime) &&
                                                new Date(Number(currentActivationTime) * 1000).toLocaleString(
                                                    navigator.language,
                                                    {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                        second: 'numeric',
                                                    }
                                                )}
                                        </span>
                                        <br />
                                        The current blocks time is{' '}
                                        {Boolean(currentBlock?.timestamp) &&
                                            new Date(Number(currentBlock?.timestamp) * 1000).toLocaleString(
                                                navigator.language,
                                                {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    second: 'numeric',
                                                }
                                            )}
                                        .
                                    </span>
                                ))}
                        </div>
                        {!Boolean(currentActivationTime) ? (
                            <Button
                                disabled={Boolean(isActive) || Boolean(currentActivationBlock) || !canActivate}
                                onClick={onClickBlockTimeActivation}
                                className="w-full md:w-auto"
                                variant={'primary'}
                            >
                                Set Activation Time
                            </Button>
                        ) : (
                            <Button
                                disabled={Boolean(isActive)}
                                onClick={onClickBlockTimeRemoveActivation}
                                className="w-full md:w-auto"
                                variant={'error'}
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                    <CaretDivider />
                    <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                        <div className="flex flex-row items-center gap-8 md:flex-grow">
                            <FaCheckDouble className={clsx([`h-8 w-8`, isActive && 'text-dapp-cyan-500'])} />
                            {isActive ? (
                                <span>Your protocol is enabled</span>
                            ) : (
                                <span>Enable the protocol, no matter of setting start time or start block</span>
                            )}
                        </div>

                        <Button
                            disabled={!canActivate}
                            onClick={onClickToggleProtocolStatus}
                            className="w-full whitespace-nowrap md:w-auto"
                            variant={isActive ? 'error' : 'primary'}
                        >
                            {isActive ? 'Disable' : 'Enable'} Protocol
                        </Button>
                    </div>
                </div>
                {!canActivate && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 border-b border-t border-dapp-blue-100 bg-dapp-blue-800/90 md:rounded-lg md:border">
                        <MdLockOutline className="h-32 w-32" />
                        <span>
                            Please choose an NFT template <br />
                            in order to enable your protocol
                        </span>
                    </div>
                )}
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
            <BlockNumberActivation
                isLoading={isLoadingEnableByBlock}
                isSuccess={isSuccessEnableByBlock}
                isPending={isPendingEnableByBlock}
                isOpen={isBlockNumberActivationModalOpen}
                onClose={onBlockNumberActivationModalClose}
                onConfirm={onBlockNumberActivationModalOK}
                onCancel={onBlockNumberActivationModalNOK}
                onChange={setActivationBlock}
                error={errorEnableByBlock}
                currentBlock={currentBlock?.number}
            />
            <BlockNumberDeactivationConfirmation
                isLoading={isLoadingEnableByBlock}
                isSuccess={isSuccessEnableByBlock}
                isPending={isPendingEnableByBlock}
                isOpen={isBlockNumberDeactivationModalOpen}
                onClose={onBlockNumberActivationModalClose}
                onConfirm={onBlockNumberActivationModalOK}
                onCancel={onBlockNumberActivationModalNOK}
                error={errorEnableByBlock}
            />
            <BlockTimeActivation
                isLoading={isLoadingEnableByTime}
                isSuccess={isSuccessEnableByTime}
                isPending={isPendingEnableByTime}
                isOpen={isBlockTimeActivationModalOpen}
                onClose={onBlockTimeActivationModalClose}
                onConfirm={onBlockTimeActivationModalOK}
                onCancel={onBlockTimeActivationModalNOK}
                onChange={(ts: number | undefined) => {
                    !isUndefined(ts) && setActivationTime(BigInt(ts))
                }}
                error={errorEnableByTime}
                currentTime={Number(currentBlock?.timestamp)}
            />
            <BlockTimeDeactivationConfirmation
                isLoading={isLoadingEnableByTime}
                isSuccess={isSuccessEnableByTime}
                isPending={isPendingEnableByTime}
                isOpen={isBlockTimeDeactivationModalOpen}
                onClose={onBlockTimeActivationModalClose}
                onConfirm={onBlockTimeActivationModalOK}
                onCancel={onBlockTimeActivationModalNOK}
                error={errorEnableByTime}
            />
        </>
    )
}
