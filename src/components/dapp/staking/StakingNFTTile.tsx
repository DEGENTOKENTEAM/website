import { useFetchTokenURI } from '@dapphooks/staking/useFetchTokenURI'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import TimeAgo from 'javascript-time-ago'
import { useMemo } from 'react'
import { IoMdOpen } from 'react-icons/io'
import { MdLockOutline } from 'react-icons/md'
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
    withdrawDate: number
    lockStartDate: number
    isBurned: boolean
    canRestake: boolean
    canWithdraw: boolean
    canClaim: boolean
    onRestake: (tokenId: bigint) => void
    onWithdraw: (tokenId: bigint) => void
    onClaim: (tokenId: bigint) => void
}
export const StakingNFTTile = ({
    protocolAddress,
    chainId,
    tokenId,
    stakedTokenSymbol,
    stakedTokenAmount,
    rewardAmount,
    rewardSymbol,
    withdrawDate,
    lockStartDate,
    isBurned,
    canRestake,
    canWithdraw,
    canClaim,
    onRestake,
    onWithdraw,
    onClaim,
}: StakingNFTTileProps) => {
    const { data, loadData } = useFetchTokenURI(protocolAddress, tokenId)
    const timeAgo = new TimeAgo(navigator.language)
    const { data: dataBlock } = useBlock({ chainId })
    useMemo(() => {
        if (data) {
            const w = window.open('about:blank')
            if (w) {
                setTimeout(() => {
                    w.document.body.style.margin = '0'
                    w.document.body.appendChild(
                        w.document.createElement('img')
                    ).src = data.image
                }, 0)
            }
        }
    }, [data])
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
                <StatsBoxTwoColumn.LeftColumn>
                    Staked {stakedTokenSymbol}
                </StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    {stakedTokenAmount}
                </StatsBoxTwoColumn.RightColumn>

                <StatsBoxTwoColumn.LeftColumn>
                    Current Rewards
                </StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <span className="mr-2">{rewardSymbol}</span> {rewardAmount}
                </StatsBoxTwoColumn.RightColumn>

                <div className="col-span-2">
                    <CaretDivider />
                </div>

                {!isBurned && (
                    <>
                        <StatsBoxTwoColumn.LeftColumn>
                            Unlock {stakedTokenSymbol} to withdraw
                        </StatsBoxTwoColumn.LeftColumn>
                        <StatsBoxTwoColumn.RightColumn>
                            <span
                                title={`${new Date(
                                    lockStartDate * 1000
                                ).toLocaleDateString(navigator.language, {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                })}, ${new Date(
                                    lockStartDate * 1000
                                ).toLocaleTimeString(navigator.language)}`}
                            >
                                {Boolean(dataBlock && dataBlock?.timestamp) &&
                                    timeAgo.format(withdrawDate * 1000, {
                                        future: true,
                                        round: 'floor',
                                        now:
                                            Number(dataBlock?.timestamp) * 1000,
                                    })}
                            </span>
                        </StatsBoxTwoColumn.RightColumn>
                    </>
                )}
                <StatsBoxTwoColumn.LeftColumn>
                    Lock started
                </StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    {new Date(lockStartDate * 1000).toLocaleDateString(
                        navigator.language,
                        {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                        }
                    )}
                    ,{' '}
                    {new Date(lockStartDate * 1000).toLocaleTimeString(
                        navigator.language
                    )}
                </StatsBoxTwoColumn.RightColumn>
            </StatsBoxTwoColumn.Wrapper>
            <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                    variant="secondary"
                    disabled={!canRestake}
                    onClick={() => onRestake(tokenId)}
                    className="gap-2"
                >
                    Re-Stake {!canRestake && <MdLockOutline />}
                </Button>
                <Button
                    variant="secondary"
                    disabled={!canWithdraw && !isBurned}
                    onClick={() => canWithdraw && onWithdraw(tokenId)}
                    className={`gap-2 ${
                        isBurned ? 'pointer-events-none cursor-default' : ''
                    }`}
                >
                    {isBurned ? (
                        <span className="font-bold text-degenOrange">
                            BURNED
                        </span>
                    ) : (
                        <>Withdraw {!canWithdraw && <MdLockOutline />}</>
                    )}
                </Button>
                <Button
                    variant="primary"
                    disabled={!canClaim}
                    onClick={() => onClaim(tokenId)}
                    className="col-span-2 gap-2"
                >
                    Claim Rewards {!canClaim && <MdLockOutline />}
                </Button>
            </div>
        </div>
    )
}
