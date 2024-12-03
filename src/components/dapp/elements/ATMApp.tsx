import { toReadableNumber } from '@dapphelpers/number'
import { useAtmClaim } from '@dapphooks/atm/useAtmClaim'
import { useAtmLockJoin } from '@dapphooks/atm/useAtmLockJoin'
import { useAtmLockLeave } from '@dapphooks/atm/useAtmLockLeave'
import { DgnxAtmStats, useAtmStats } from '@dapphooks/atm/useAtmStats'
import { DngxAtmStatsForQualifier, useAtmStatsForQualifier } from '@dapphooks/atm/useAtmStatsForQualifier'
import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount, useBlock, useSwitchChain } from 'wagmi'
import { Button } from '../../Button'
import { H2 } from '../../H2'
import { Spinner } from './Spinner'

const AtmLockRewardPreview = (props: { claimAmountWithLock: string; claimAmountWithoutLock: string }) => {
    return (
        <>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 ">
                <div className="font-bold">Estimated DGNX amount with lock:</div>
                <div className="font-bold">{props.claimAmountWithLock}* DGNX</div>
                <div className="mt-8 font-bold sm:mt-0">Estimated DGNX amount without lock:</div>
                <div className="font-bold">{props.claimAmountWithoutLock}* DGNX</div>
            </div>
            <div className=" mt-8 text-sm italic">
                * Please note that the DGNX amounts will adapt shortly before the claiming starts accordingly to the
                launch market price.
            </div>
        </>
    )
}

const AtmDepositForm = (props: { stats: DgnxAtmStats; statsForQualifier: DngxAtmStatsForQualifier }) => {
    // const { address } = useAccount()
    // const { data: nativeBalance } = useBalance({ address })
    // const [depositAmount, setDepositAmount] = useState(0)
    // const tokensToBurnInputRef = useRef<HTMLInputElement>(null)
    // const minDeposit = new BigNumber(0.000000000000000001)
    // const [enteredDepositAmount, setEnteredDepositAmount] = useState<string>()
    // const { write, isLoading, isSuccess, hash } = useAtmDeposit(
    //     BigNumber(
    //         depositAmount < minDeposit.toNumber()
    //             ? minDeposit.toString()
    //             : depositAmount
    //     ).multipliedBy(10 ** 18)
    // )
    // const maximum = useMemo(() => {
    //     if (
    //         !isSuccess ||
    //         !nativeBalance ||
    //         !props.stats ||
    //         !props.statsForQualifier
    //     )
    //         return 0
    //     return BigNumber.min(
    //         new BigNumber(nativeBalance.value.toString()).div(10 ** 18),
    //         props.stats.allocationLimit
    //             .div(10 ** 18)
    //             .minus(props.statsForQualifier.totalDeposited.div(10 ** 18))
    //     ).toNumber()
    // }, [props.stats, props.statsForQualifier, isSuccess, nativeBalance])
    // return (
    //     <div>
    //         {!isLoading && (
    //             <>
    //                 {props.stats.allocationLimit
    //                     .minus(props.statsForQualifier.totalDeposited)
    //                     .gt(0) && (
    //                     <>
    //                         <p className="mt-3 font-bold">
    //                             How much do you want to deposit?
    //                         </p>
    //                         <input
    //                             className="my-2 w-full rounded-xl border-2 border-degenOrange bg-light-100 py-2 text-2xl leading-3 text-light-800 ring-0 focus:border-degenOrange focus:shadow-none focus:outline-none focus:ring-0 dark:border-activeblue dark:bg-dark dark:text-light-200"
    //                             type="number"
    //                             placeholder="0"
    //                             disabled={isLoading}
    //                             max={maximum}
    //                             min={0.0001}
    //                             step={0.1}
    //                             onChange={(e) =>
    //                                 setDepositAmount(
    //                                     !!e.target.value
    //                                         ? parseFloat(e.target.value) <
    //                                           minDeposit.toNumber()
    //                                             ? parseFloat(
    //                                                   minDeposit.toString()
    //                                               )
    //                                             : parseFloat(e.target.value)
    //                                         : 0
    //                                 )
    //                             }
    //                             ref={tokensToBurnInputRef}
    //                         />
    //                         <p
    //                             className="-mt-1 mr-3 cursor-pointer text-right underline"
    //                             onClick={() => {
    //                                 if (
    //                                     tokensToBurnInputRef &&
    //                                     tokensToBurnInputRef.current
    //                                 )
    //                                     tokensToBurnInputRef.current.value = `${maximum}`
    //                                 setDepositAmount(maximum)
    //                             }}
    //                         >
    //                             MAX
    //                         </p>
    //                         {depositAmount > 0 && depositAmount > maximum && (
    //                             <>
    //                                 <p className="font-bold text-error">
    //                                     Deposit higher than maximum
    //                                 </p>
    //                             </>
    //                         )}
    //                         {props.stats.tokensPerOneNative.gt(0) && (
    //                             <>
    //                                 <AtmLockRewardPreview
    //                                     claimAmountWithLock={
    //                                         depositAmount *
    //                                         props.stats.tokensPerOneNative
    //                                             .div(10 ** 18)
    //                                             .toNumber()
    //                                     }
    //                                     claimAmountWithoutLock={
    //                                         depositAmount *
    //                                         props.stats.tokensPerOneNative
    //                                             .div(10 ** 18)
    //                                             .toNumber() *
    //                                         (1 +
    //                                             props.stats.totalRewardBps.toNumber() /
    //                                                 10000)
    //                                     }
    //                                 />
    //                             </>
    //                         )}
    //                         <Button
    //                             className="mt-3 w-full"
    //                             color={
    //                                 depositAmount == 0 ||
    //                                 depositAmount > maximum
    //                                     ? 'disabled'
    //                                     : 'orange'
    //                             }
    //                             disabled={
    //                                 depositAmount == 0 ||
    //                                 depositAmount > maximum
    //                             }
    //                             onClick={() => {
    //                                 if (
    //                                     BigNumber(
    //                                         tokensToBurnInputRef &&
    //                                             tokensToBurnInputRef.current
    //                                             ? tokensToBurnInputRef.current
    //                                                   .value
    //                                             : 0
    //                                     ).lt(minDeposit)
    //                                 ) {
    //                                     toast.error(
    //                                         'Please change the amount to at least 0.000000000000000001',
    //                                         { autoClose: 5000 }
    //                                     )
    //                                 } else {
    //                                     write()
    //                                 }
    //                             }}
    //                         >
    //                             Deposit
    //                         </Button>
    //                     </>
    //                 )}
    //                 {props.stats.allocationLimit
    //                     .minus(props.statsForQualifier.totalDeposited)
    //                     .eq(0) && (
    //                     <>
    //                         <p className="mt-4 font-bold text-success">
    //                             Your deposit limit is reached. You can&apos;t
    //                             deposit more ETH. Please wait until the claiming
    //                             phase starts. This will be announced through
    //                             Telegram
    //                         </p>
    //                     </>
    //                 )}
    //             </>
    //         )}
    //         {isLoading && (
    //             <div className="mt-5">
    //                 <Spinner />
    //             </div>
    //         )}
    //         {isSuccess && (
    //             <div className="mt-5 rounded-xl border-2 border-techGreen bg-broccoli p-3 font-bold">
    //                 Deposit success!{' '}
    //                 <a
    //                     href={`https://etherscan.io/tx/${hash}`}
    //                     target="_blank"
    //                     rel="noreferrer"
    //                     className="text-degenOrange"
    //                 >
    //                     View tx
    //                 </a>
    //             </div>
    //         )}
    //     </div>
    // )
    return <div>ToDo, refactor for new Wagmi Version when needed</div>
}

const AtmCollection = (props: { stats: DgnxAtmStats }) => {
    const { stats } = props
    const { address } = useAccount()
    const statsForQualifier = useAtmStatsForQualifier(address!)

    if (statsForQualifier.loading == 'yes') return null

    return (
        <div className="max-w-2xl">
            <H2>The ATM is currently accepting deposits!</H2>
            <div className="grid grid-cols-2">
                <div>Maximum deposit per wallet:</div>
                <div className="font-bold">{Number(stats.allocationLimit / 10n ** 18n)} ETH</div>
                {statsForQualifier.isWhitelisted && (
                    <>
                        <div>Amount you deposited:</div>
                        <div className="font-bold">{Number(statsForQualifier.totalDeposited / 10n ** 18n)} ETH</div>
                        <div>Amount you can still deposit:</div>
                        <div className="font-bold">
                            {Number((stats.allocationLimit - statsForQualifier.totalDeposited) / 10n ** 18n)} ETH
                        </div>
                    </>
                )}
                {!statsForQualifier.isWhitelisted && (
                    <div className="col-span-2 mt-5 font-bold text-error">Your wallet is not whitelisted</div>
                )}
            </div>

            {statsForQualifier.isWhitelisted && <AtmDepositForm stats={stats} statsForQualifier={statsForQualifier} />}
        </div>
    )
}

const AtmClaimForm = (props: { stats: DgnxAtmStats; statsForQualifier: DngxAtmStatsForQualifier }) => {
    const [blockTimeStamp, setBlockTimeStamp] = useState(0n)
    const [actionInProgess, setActionInProgress] = useState(false)

    const { write: claimWrite, isLoading: claimLoading, isSuccess: claimSuccess, hash: claimHash } = useAtmClaim()

    const {
        write: lockJoinWrite,
        isLoading: lockJoinLoading,
        isSuccess: lockJoinSuccess,
        hash: lockJoinHash,
    } = useAtmLockJoin()

    const {
        write: lockLeaveWrite,
        isLoading: lockLeaveLoading,
        isSuccess: lockLeaveSuccess,
        hash: lockLeaveHash,
    } = useAtmLockLeave()

    const { data: block } = useBlock()

    useEffect(() => block && setBlockTimeStamp(block.timestamp), [block])

    const lockTimeProgress = useMemo(
        () =>
            Number(
                blockTimeStamp &&
                    props.stats &&
                    Number(blockTimeStamp - props.stats.lockPeriodStarts) / Number(props.stats.lockPeriodInSeconds)
            ),
        [props.stats, blockTimeStamp]
    )

    const startTime = useMemo(() => {
        return new Date(Number(props.stats.lockPeriodStarts) * 1000).toLocaleDateString(navigator.language, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        })
    }, [props.stats])

    const endTime = useMemo(() => {
        return new Date(Number(props.stats.lockPeriodEnds) * 1000).toLocaleDateString(navigator.language, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        })
    }, [props.stats])

    if (props.statsForQualifier.hasClaimed) {
        return (
            <p className="font-bold text-success">
                You have claimed your {toReadableNumber(props.statsForQualifier.claimedAmount, 18)} DGNX share!
            </p>
        )
    }

    if (props.statsForQualifier.hasLocked) {
        return (
            <>
                <h2 className="mt-10 text-xl font-bold">Locked</h2>
                <p className="mt-2 font-bold">{toReadableNumber(props.statsForQualifier.lockedAmount, 18)} DGNX</p>
                {!props.stats.lockPeriodActive && (
                    <>
                        <p className="mt-10 font-bold">
                            What will happen next:
                            <br />
                            1. The lock or claim will run approx. 3 days from start.
                            <br />
                            2. Lock period start will be announced in time in the VC Telegram group
                        </p>
                    </>
                )}
                {props.stats.lockPeriodActive && (
                    <>
                        <h2 className="mt-10 text-xl font-bold">Collected Rewards</h2>
                        <div className="relative flex flex-col text-clip">
                            <div
                                className="mb-1 mt-2 w-0 whitespace-nowrap text-center"
                                style={{
                                    width: `${lockTimeProgress ? String(Number(lockTimeProgress) * 100) : '0'}%`,
                                }}
                            >
                                {toReadableNumber(props.statsForQualifier.currentRewardAmount, 18)} DGNX
                            </div>
                            <div className="absolute right-0 leading-10">
                                {toReadableNumber(props.statsForQualifier.estimatedTotalRewardAmount, 18)} DGNX
                            </div>
                        </div>

                        <div className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className="h-2.5 w-0 rounded-r-full bg-degenOrange transition-all duration-1000 ease-out"
                                style={{
                                    width: `${lockTimeProgress ? String(Number(lockTimeProgress) * 100) : '0'}%`,
                                }}
                            ></div>
                        </div>

                        <div className="flex">
                            <div>{startTime}</div>
                            <div className="grow" />
                            <div>{endTime}</div>
                        </div>
                    </>
                )}
                <div className="my-6 font-bold">
                    {!lockLeaveLoading && !lockLeaveSuccess && (
                        <>
                            <Button
                                className="my-3 w-full"
                                color="orange"
                                onClick={() => {
                                    lockLeaveWrite()
                                }}
                            >
                                Claim now
                            </Button>
                        </>
                    )}
                    {lockLeaveLoading && <Spinner />}
                    {lockLeaveSuccess && (
                        <>
                            Success!
                            <div className="cursor-pointer rounded-xl border-2 border-techGreen bg-broccoli p-3 font-bold transition-colors hover:bg-techGreen">
                                <a
                                    href={`https://etherscan.io/tx/${lockLeaveHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="size-full"
                                >
                                    View tx
                                </a>
                            </div>
                        </>
                    )}
                </div>
                <p className="italic">
                    <span className="font-bold">Important:</span> You can claim your tokens at any time. Once
                    you&apos;ve claimed your tokens, you&apos;re no longer eligible to rejoin the extra reward program.
                    If you claim your tokens prior to the end of the 365 day period, any extra rewards will be charged
                    with a {Number(props.stats.rewardPenaltyBps) / 100}% loyalty penalty.
                </p>
            </>
        )
    } else {
        return (
            <>
                <p className="font-bold">
                    Lock your{' '}
                    {toReadableNumber(
                        props.statsForQualifier.estimatedTotalClaimAmount -
                            props.statsForQualifier.estimatedTotalRewardAmount,
                        18
                    )}{' '}
                    DGNX in the next 3 days to receive{' '}
                    {toReadableNumber(props.statsForQualifier.estimatedTotalClaimAmount)} DGNX over 365 days, or claim
                    your DNGX right now!
                </p>
                <div className="mt-5 flex w-full flex-col items-center">
                    <div className="relative flex items-center rounded-xl border-2 border-activeblue bg-darkblue p-5 font-bold">
                        <div className="flex w-48 justify-center">
                            Invested {toReadableNumber(props.statsForQualifier.totalDeposited)} ETH
                        </div>
                        <div className="absolute left-1/2 top-[calc(100%+0.1rem)] z-10 h-[4.4rem] w-[2px] bg-activeblue" />
                        <div
                            className={clsx(
                                'absolute -left-6 top-[calc(100%+4.4rem)] z-10 h-12 w-[2px]',
                                props.stats.lockPeriodActive ? 'bg-darkblue' : 'bg-activeblue'
                            )}
                        />
                        <div className="absolute -right-6 top-[calc(100%+4.4rem)] z-10 h-12 w-[2px] bg-activeblue" />
                        <div
                            className={clsx(
                                'absolute -left-6 top-[calc(100%+4.4rem)] z-10 h-[2px] w-[8.8rem]',
                                props.stats.lockPeriodActive ? 'bg-darkblue' : 'bg-activeblue'
                            )}
                        />
                        <div className="absolute -right-6 top-[calc(100%+4.4rem)] z-10 h-[2px] w-[8.8rem] bg-activeblue" />
                    </div>
                    <div className="h-24" />
                    <div className="mt-5 grid grid-cols-2 gap-16">
                        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-activeblue bg-darkblue p-5 font-bold text-success">
                            {!lockJoinLoading && !lockJoinSuccess && (
                                <>
                                    <Button
                                        className="w-full"
                                        color={props.stats.lockPeriodActive ? 'disabled' : 'orange'}
                                        onClick={() => {
                                            lockJoinWrite()
                                        }}
                                    >
                                        Lock
                                    </Button>
                                    {props.stats.lockPeriodActive ? (
                                        'Lock option expired'
                                    ) : (
                                        <span className="text-center">
                                            Lock for{' '}
                                            {toReadableNumber(props.statsForQualifier.estimatedTotalClaimAmount, 18)}{' '}
                                            DGNX <br />
                                            <span className="font-bold">over time</span>
                                        </span>
                                    )}
                                </>
                            )}
                            {lockJoinLoading && <Spinner />}
                            {lockJoinSuccess && (
                                <>
                                    Success!
                                    <div className="cursor-pointer rounded-xl border-2 border-techGreen bg-broccoli p-3 font-bold transition-colors hover:bg-techGreen">
                                        <a
                                            href={`https://etherscan.io/tx/${lockJoinHash}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="size-full"
                                        >
                                            View tx
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-activeblue bg-darkblue p-5 font-bold">
                            {!claimLoading && !claimSuccess && (
                                <>
                                    <Button
                                        className="w-full"
                                        color="orange"
                                        disabled={lockJoinLoading || claimLoading}
                                        onClick={() => {
                                            claimWrite()
                                        }}
                                    >
                                        Claim
                                    </Button>
                                    Receive
                                    {toReadableNumber(
                                        props.statsForQualifier.estimatedTotalClaimAmount -
                                            props.statsForQualifier.estimatedTotalRewardAmount,
                                        18
                                    )}{' '}
                                    DGNX
                                </>
                            )}
                            {claimLoading && <Spinner />}
                            {claimSuccess && (
                                <>
                                    Success!
                                    <div className="cursor-pointer rounded-xl border-2 border-techGreen bg-broccoli p-3 font-bold transition-colors hover:bg-techGreen">
                                        <a
                                            href={`https://etherscan.io/tx/${claimHash}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="size-full"
                                        >
                                            View tx
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

const AtmClaiming = (props: { stats: DgnxAtmStats }) => {
    const { stats } = props
    const { address } = useAccount()
    const statsForQualifier = useAtmStatsForQualifier(address!)

    if (statsForQualifier.loading == 'yes') return null

    return (
        <div className="max-w-2xl">
            <H2>The ATM is currently accepting claims!</H2>
            {statsForQualifier.totalDeposited <= 0n ? (
                <p className="font-bold text-error">This wallet has no claim</p>
            ) : (
                <AtmClaimForm stats={stats} statsForQualifier={statsForQualifier} />
            )}
        </div>
    )
}

export const ATMApp = () => {
    const { switchChain } = useSwitchChain()
    const { address, isConnected, chainId } = useAccount()
    const statsForQualifier = useAtmStatsForQualifier(address!)
    const stats = useAtmStats()

    const onClickSwitchToETH = useCallback(() => {
        switchChain && switchChain({ chainId: 1 })
    }, [switchChain])

    if (!isConnected) {
        return <div className="font-bold">Please connect wallet</div>
    }

    if (chainId !== 1 && chainId !== 5) {
        return (
            <div className="max-w-2xl">
                <div className="font-bold">The ATM is only available on ETH</div>
                <Button className="mt-3 w-full" color="orange" onClick={() => onClickSwitchToETH()}>
                    Switch to ETH
                </Button>
            </div>
        )
    }

    if (stats.loading === 'yes' || statsForQualifier.loading === 'yes') {
        return null
    }

    if (!stats.collecting && !stats.claiming && stats.totalDeposits == 0n) {
        return <div className="font-bold">The ATM is currently offline</div>
    }

    if (!stats.collecting && !stats.claiming && stats.totalDeposits > 0n) {
        return (
            <>
                <div className="mb-8 font-bold">
                    The collection phase has finished. Please wait until the claiming starts. It&apos;ll be announced in
                    the VC Telegram group.
                </div>
                <div className="mb-8 font-bold">
                    Total amount collected: <br className="sm:hidden" />
                    {toReadableNumber(stats.totalDeposits, 18)} ETH
                </div>
                <div className="text-xl font-bold">
                    Your deposited amount: <br className="sm:hidden" />
                    {toReadableNumber(statsForQualifier.totalDeposited, 18)} ETH
                </div>
                <AtmLockRewardPreview
                    claimAmountWithLock={toReadableNumber(statsForQualifier.estimatedTotalClaimAmount, 18)}
                    claimAmountWithoutLock={toReadableNumber(
                        statsForQualifier.estimatedTotalClaimAmount - statsForQualifier.estimatedTotalRewardAmount,
                        18
                    )}
                />
            </>
        )
    }

    if (stats.collecting) {
        return <AtmCollection stats={stats} />
    }

    if (stats.claiming) {
        return <AtmClaiming stats={stats} />
    }

    return <></>
}
