import { useFetchTokenURI } from '@dapphooks/staking/useFetchTokenURI'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import clsx from 'clsx'
import { Tooltip } from 'flowbite-react'
import TimeAgo from 'javascript-time-ago'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { IoMdOpen } from 'react-icons/io'
import { MdLockOutline } from 'react-icons/md'
import { PiCaretDownBold, PiCaretUpBold } from 'react-icons/pi'
import { Address } from 'viem'
import { useBlock } from 'wagmi'
import { Button } from '../../Button'

type StakingNFTTileProps = {
    protocolAddress: Address
    chainId: number
    tokenId: bigint
    stakedTokenSymbol: string
    stakedTokenAmount: string
    rewardAmount: string
    rewardSymbol: string
    lockDuration: number
    withdrawDate: number
    lockStartDate: number
    isBurned: boolean
    isLocked: boolean
    canRestake: boolean
    canWithdraw: boolean
    canClaim: boolean
    canUpstake: boolean
    canMerge: boolean
    canAddUp: boolean
    onRestake: (tokenId: bigint) => void
    onWithdraw: (tokenId: bigint) => void
    onClaim: (tokenId: bigint) => void
    onUpstake: (tokenId: bigint) => void
    onMerge: (tokenId: bigint) => void
    onAddUp: (tokenId: bigint) => void
}
export const StakingNFTTile = ({
    protocolAddress,
    chainId,
    tokenId,
    stakedTokenSymbol,
    stakedTokenAmount,
    rewardAmount,
    rewardSymbol,
    lockDuration,
    withdrawDate,
    lockStartDate,
    isBurned,
    isLocked,
    canRestake,
    canWithdraw,
    canClaim,
    canUpstake,
    canMerge,
    canAddUp,
    onRestake,
    onWithdraw,
    onClaim,
    onUpstake,
    onMerge,
    onAddUp,
}: StakingNFTTileProps) => {
    const { data, loadData } = useFetchTokenURI(protocolAddress, tokenId)
    const timeAgo = new TimeAgo(navigator.language)
    const { data: dataBlock } = useBlock({ chainId })
    const [openContext, setOpenContext] = useState(false)

    const contextMenu = useRef<HTMLDivElement>(null)

    const [openContextToNorth, setOpenContextToNorth] = useState(false)

    const onClickHandlerOpenContextMenu = () => {
        setOpenContext(!openContext)
        !openContext && setOpenContextToNorth(false)
    }

    useMemo(() => {
        data &&
            fetch(data.image)
                .then((res) => res.blob())
                .then((blob) => {
                    const url = URL.createObjectURL(blob)
                    const w = window.open(url)
                    if (w) w.onload = (_) => URL.revokeObjectURL(url)
                })
    }, [data])

    useLayoutEffect(() => {
        if (openContext && contextMenu.current) {
            const { bottom } = contextMenu.current.getBoundingClientRect()
            setOpenContextToNorth(bottom > (window.innerHeight || document.documentElement.clientHeight))
        }

        if (!openContext) setOpenContextToNorth(false)
    }, [openContext])

    return (
        <div className="flex flex-col gap-1 rounded-lg bg-dapp-blue-400 p-3">
            <div className="flex items-center gap-2 text-xs text-darkTextLowEmphasis">
                <span>#{tokenId.toString()}</span>{' '}
                <button
                    onClick={() => {
                        loadData()
                    }}
                >
                    <IoMdOpen />
                </button>
            </div>
            <StatsBoxTwoColumn.Wrapper className="text-sm">
                <StatsBoxTwoColumn.LeftColumn>Staked {stakedTokenSymbol}</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>{stakedTokenAmount}</StatsBoxTwoColumn.RightColumn>

                <StatsBoxTwoColumn.LeftColumn>Current Rewards</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <span className="mr-2">{rewardSymbol}</span> {rewardAmount}
                </StatsBoxTwoColumn.RightColumn>

                {withdrawDate != lockStartDate && (
                    <>
                        <div className="col-span-2">
                            <CaretDivider />
                        </div>

                        {!isBurned && (
                            <>
                                <StatsBoxTwoColumn.LeftColumn>
                                    Unlock {stakedTokenSymbol} to withdraw
                                </StatsBoxTwoColumn.LeftColumn>
                                <StatsBoxTwoColumn.RightColumn>
                                    <div className="flex items-center justify-end gap-2">
                                        <span
                                            className={clsx([
                                                !isLocked && Date.now() < withdrawDate * 1000 && 'line-through',
                                            ])}
                                            title={`${new Date(withdrawDate * 1000).toLocaleDateString(
                                                navigator.language,
                                                {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                }
                                            )}, ${new Date(lockStartDate * 1000).toLocaleTimeString(
                                                navigator.language
                                            )}`}
                                        >
                                            {Boolean(dataBlock && dataBlock?.timestamp) &&
                                                timeAgo.format(withdrawDate * 1000, {
                                                    future: true,
                                                    round: 'floor',
                                                    now: Number(dataBlock?.timestamp) * 1000,
                                                })}
                                        </span>
                                        {!isLocked && Date.now() < withdrawDate * 1000 && (
                                            <>
                                                <span className="animate-bounce pl-2 font-bold text-degenOrange">
                                                    NOW
                                                </span>
                                                <Tooltip
                                                    content={
                                                        <span>
                                                            <span className="font-bold">Your stake got unlocked</span>{' '}
                                                            <br />
                                                            This happens when the pool you&apos;ve staked into has
                                                            changed its parameters to your disadvantage.
                                                        </span>
                                                    }
                                                    className="max-w-[400px] text-center"
                                                >
                                                    <AiOutlineQuestionCircle className="size-5" />
                                                </Tooltip>
                                            </>
                                        )}
                                    </div>
                                </StatsBoxTwoColumn.RightColumn>
                            </>
                        )}
                        <StatsBoxTwoColumn.LeftColumn>Lock started</StatsBoxTwoColumn.LeftColumn>
                        <StatsBoxTwoColumn.RightColumn>
                            {new Date(lockStartDate * 1000).toLocaleDateString(navigator.language, {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                            })}
                            , {new Date(lockStartDate * 1000).toLocaleTimeString(navigator.language)}
                        </StatsBoxTwoColumn.RightColumn>
                    </>
                )}
            </StatsBoxTwoColumn.Wrapper>
            <div className={clsx(['mt-2 grid gap-3', canUpstake ? 'grid-cols-7' : 'grid-cols-2'])}>
                {openContext && (
                    <div
                        onClick={onClickHandlerOpenContextMenu}
                        className="fixed inset-0 z-10 bg-dapp-blue-800/90"
                    ></div>
                )}
                <div className={clsx(['relative col-span-7 grid gap-3', openContext && 'z-30'])}>
                    {openContext && (
                        <div
                            ref={contextMenu}
                            className={clsx([
                                'absolute -left-3 -right-3 z-20 rounded-lg bg-dapp-blue-400 px-3 text-dapp-blue-800',
                                openContextToNorth ? '-bottom-3 pb-16 pt-3' : '-top-3 pb-3 pt-16',
                            ])}
                        >
                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="secondary"
                                    disabled={!canRestake}
                                    onClick={() => {
                                        setOpenContext(false)
                                        onRestake(tokenId)
                                    }}
                                    className="flex w-full gap-2"
                                >
                                    Restake {!canRestake && <MdLockOutline />}
                                </Button>
                                {canAddUp && (
                                    <Button
                                        onClick={() => {
                                            setOpenContext(false)
                                            onAddUp(tokenId)
                                        }}
                                        variant="secondary"
                                        className="cursor-pointer whitespace-nowrap"
                                    >
                                        Add Tokens
                                    </Button>
                                )}
                                {canUpstake && (
                                    <Button
                                        onClick={() => {
                                            setOpenContext(false)
                                            onUpstake(tokenId)
                                        }}
                                        variant="secondary"
                                        className="cursor-pointer whitespace-nowrap"
                                    >
                                        Upstake
                                    </Button>
                                )}
                                {canMerge && (
                                    <Button
                                        onClick={() => {
                                            setOpenContext(false)
                                            onMerge(tokenId)
                                        }}
                                        variant="secondary"
                                        className="cursor-pointer whitespace-nowrap"
                                    >
                                        Merge
                                    </Button>
                                )}
                                {!isBurned && (
                                    <Button
                                        variant="secondary"
                                        disabled={!canWithdraw}
                                        onClick={() => {
                                            if (canWithdraw) {
                                                setOpenContext(false)
                                                onWithdraw(tokenId)
                                            }
                                        }}
                                        className="flex w-full gap-2"
                                    >
                                        Withdraw {!canWithdraw && <MdLockOutline />}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                    <div
                        className={clsx([
                            'flex w-full items-center justify-center text-dapp-blue-800',
                            openContext && 'z-40',
                        ])}
                    >
                        <button
                            disabled={!canClaim}
                            onClick={() => {
                                setOpenContext(false)
                                onClaim(tokenId)
                            }}
                            className="flex grow items-center justify-center gap-2 rounded-l-lg border border-dapp-cyan-500 border-r-dapp-blue-800/10 bg-dapp-cyan-500 px-4 py-2 font-semibold leading-5 hover:border-dapp-cyan-500/0 hover:border-r-dapp-blue-800/10 hover:bg-dapp-cyan-500/70 focus:outline-none active:border-dapp-cyan-50 disabled:opacity-40 disabled:hover:opacity-40"
                        >
                            Claim Rewards {!canClaim && <MdLockOutline />}
                        </button>
                        <button
                            onClick={onClickHandlerOpenContextMenu}
                            className={clsx([
                                'focus:outline-non h-full rounded-br-lg rounded-tr-lg border border-dapp-cyan-500 border-l-dapp-blue-800/40 bg-dapp-cyan-500 px-3 py-2 leading-5 hover:border-dapp-cyan-500/0 hover:border-l-dapp-blue-800/40 hover:bg-dapp-cyan-500/70',
                            ])}
                        >
                            {openContext ? <PiCaretUpBold /> : <PiCaretDownBold />}
                        </button>
                    </div>
                </div>
                {isBurned && (
                    <Button
                        variant="secondary"
                        className="pointer-events-none col-span-7 flex w-full cursor-default gap-2"
                    >
                        <span className="font-bold text-degenOrange">🔥 BURNED 🔥</span>
                    </Button>
                )}
            </div>
        </div>
    )
}
