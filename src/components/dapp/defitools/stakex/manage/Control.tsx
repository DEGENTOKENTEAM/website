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
import { Button } from 'src/components/Button'
import { useBlock } from 'wagmi'
import { BlockNumberActivation } from './control/overlays/BlockNumberActivation'
import { BlockNumberDeactivationConfirmation } from './control/overlays/BlockNumberDeactivationConfirmation'
import { BlockTimeActivation } from './control/overlays/BlockTimeActivation'
import { BlockTimeDeactivationConfirmation } from './control/overlays/BlockTimeDeactivationConfirmation'
import { DisableProtocolConfirmation } from './control/overlays/DisableProtocolConfirmation'

export const Control = () => {
    const {
        data: { protocol, chain, isOwner },
    } = useContext(ManageStakeXContext)

    const timeAgo = new TimeAgo(navigator.language)

    const [isActive, setIsActive] = useState<boolean | null>(null)
    const [isApplyChangesModalOpen, setIsApplyChangesModalOpen] =
        useState(false)
    const [
        isBlockNumberActivationModalOpen,
        setIsBlockNumberActivationModalOpen,
    ] = useState(false)
    const [
        isBlockNumberDeactivationModalOpen,
        setIsBlockNumberDeactivationModalOpen,
    ] = useState(false)
    const [isBlockTimeActivationModalOpen, setIsBlockTimeActivationModalOpen] =
        useState(false)
    const [
        isBlockTimeDeactivationModalOpen,
        setIsBlockTimeDeactivationModalOpen,
    ] = useState(false)
    const [activationBlock, setActivationBlock] = useState<bigint>()
    const [activationTime, setActivationTime] = useState<bigint>()

    const { data: currentBlock } = useBlock({
        query: { enabled: Boolean(chain?.id) },
        chainId: chain?.id,
        watch: true,
    })

    const { data: dataNFTConfigs } = useNFTGetConfigs(protocol, chain?.id!)
    const { refetch: refetchIsRunning } = useActive(protocol, chain?.id!)
    const { data: dataIsActive, refetch: refetchIsActive } = useActive(
        protocol,
        chain?.id!
    )
    const { data: currentActivationBlock, refetch: refetchActivationBlock } =
        useGetActivationBlock(protocol, chain?.id!)
    const { data: currentActivationTime, refetch: refetchActivationTime } =
        useGetActivationTime(protocol, chain?.id!)

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
        refetchIsRunning && refetchIsRunning()
        setIsApplyChangesModalOpen(false)
    }

    const {
        error: errorEnableByBlock,
        isLoading: isLoadingEnableByBlock,
        isPending: isPendingEnableByBlock,
        isSuccess: isSuccessEnableByBlock,
        reset: resetEnableByBlock,
        write: writeEnableByBlock,
    } = useEnableProtocolByBlock(protocol, chain?.id!, activationBlock!)
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
        isLoading: isLoadingEnableByTime,
        isPending: isPendingEnableByTime,
        isSuccess: isSuccessEnableByTime,
        reset: resetEnableByTime,
        write: writeEnableByTime,
    } = useEnableProtocolByTime(protocol, chain?.id!, activationTime!)
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
    }, [dataIsActive])

    return (
        <>
            <Tile className="w-full ">
                <div className="flex flex-row items-center">
                    <span className="flex-1 font-title text-xl font-bold">
                        Access Management
                    </span>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                    <div
                        className={clsx([
                            `flex flex-row items-center gap-8`,
                            Boolean(currentActivationTime) && 'opacity-30',
                        ])}
                    >
                        <FaCubes className="h-8 w-8" />{' '}
                        {Boolean(currentBlock) &&
                            (!Boolean(currentActivationBlock) ? (
                                <span className="flex-grow">
                                    Set Block Number when the protocol should
                                    start
                                </span>
                            ) : (
                                <span className="flex-grow">
                                    Your protocol is about to start on block{' '}
                                    <span className="font-bold">
                                        {currentActivationBlock?.toString()}
                                    </span>
                                    <br />
                                    Blocks left for start:{' '}
                                    {(
                                        currentActivationBlock! -
                                        currentBlock?.number!
                                    ).toString()}
                                    . <br />
                                    The current block is{' '}
                                    {currentBlock?.number.toString()}.
                                </span>
                            ))}
                        {isOwner &&
                            (!Boolean(currentActivationBlock) ? (
                                <Button
                                    disabled={
                                        Boolean(isActive) ||
                                        Boolean(currentActivationTime)
                                    }
                                    onClick={onClickBlockNumberActivation}
                                    variant={'primary'}
                                >
                                    Set Activation Block
                                </Button>
                            ) : (
                                <Button
                                    disabled={Boolean(isActive)}
                                    onClick={onClickBlockNumberRemoveActivation}
                                    variant={'error'}
                                >
                                    Reset
                                </Button>
                            ))}
                    </div>
                    <div
                        className={clsx([
                            `flex flex-row items-center gap-8`,
                            Boolean(currentActivationBlock) && 'opacity-30',
                        ])}
                    >
                        <FaRegClock className="h-8 w-8" />
                        {Boolean(currentBlock) &&
                            (!Boolean(currentActivationTime) ? (
                                <span className="flex-grow">
                                    Set a time when the protocol should start
                                </span>
                            ) : (
                                <span className="flex-grow">
                                    Your protocol is about to start{' '}
                                    {timeAgo.format(
                                        Number(currentActivationTime) * 1000,
                                        {
                                            future: true,
                                            round: 'round',
                                            now:
                                                Number(
                                                    currentBlock?.timestamp
                                                ) * 1000,
                                        }
                                    )}{' '}
                                    at{' '}
                                    <span className="font-bold">
                                        {Boolean(currentActivationTime) &&
                                            new Date(
                                                Number(currentActivationTime) *
                                                    1000
                                            ).toLocaleString(
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
                                        new Date(
                                            Number(currentBlock?.timestamp) *
                                                1000
                                        ).toLocaleString(navigator.language, {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                        })}
                                    .
                                </span>
                            ))}
                        {isOwner &&
                            (!Boolean(currentActivationTime) ? (
                                <Button
                                    disabled={
                                        Boolean(isActive) ||
                                        Boolean(currentActivationBlock)
                                    }
                                    onClick={onClickBlockTimeActivation}
                                    variant={'primary'}
                                >
                                    Set Activation Time
                                </Button>
                            ) : (
                                <Button
                                    disabled={Boolean(isActive)}
                                    onClick={onClickBlockTimeRemoveActivation}
                                    variant={'error'}
                                >
                                    Reset
                                </Button>
                            ))}
                    </div>
                    <CaretDivider />
                    <div className="flex flex-row items-center gap-8">
                        <FaCheckDouble className="h-8 w-8" />
                        <span className="flex-grow">
                            Enable the protocol, no matter of setting start time
                            or start block
                        </span>
                        {isOwner && (
                            <Button
                                disabled={
                                    !dataNFTConfigs || !dataNFTConfigs?.length
                                }
                                onClick={onClickToggleProtocolStatus}
                                className="whitespace-nowrap"
                                variant={isActive ? 'error' : 'primary'}
                            >
                                {isActive ? 'Disable' : 'Enable'} Protocol
                            </Button>
                        )}
                    </div>
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
