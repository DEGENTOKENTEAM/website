import abi from '@dappabis/disburser.json'
import { toReadableNumber } from '@dapphelpers/number'
import { useDisburserClaim } from '@dapphooks/disburser/useDisburserClaim'
import { useEffect } from 'react'
import { RouteObject } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import { useCountdownTimer } from 'use-countdown-timer'
import { useAccount, useReadContract } from 'wagmi'
import { Button } from '../../Button'
import { Spinner } from './Spinner'

const DISBURSER_ADDRESS = '0x8a0E3264Da08bf999AfF5a50AabF5d2dc89fab79'

const countdownStr = (s: number) => {
    const d = Math.floor(s / (3600 * 24))
    s -= d * 3600 * 24
    const h = Math.floor(s / 3600)
    s -= h * 3600
    const m = Math.floor(s / 60)
    s -= m * 60
    const tmp: string[] = []
    d && tmp.push(d + 'd')
    ;(d || h) && tmp.push(h + 'h')
    ;(d || h || m) && tmp.push(m + 'm')
    tmp.push(s + 's')
    return tmp.join(' ')
}

const Countdown = (props: { seconds: number }) => {
    const { countdown, start, isRunning } = useCountdownTimer({
        timer: 1000 * props.seconds,
    })

    useEffect(() => {
        if (!isRunning) {
            start()
        }
    }, [isRunning, start])

    return <div>Claim in {countdownStr(countdown / 1000)}</div>
}

const ClaimButton = (props: { amount: string | number }) => {
    const { write, isLoading, isSuccess, isError, error } = useDisburserClaim(DISBURSER_ADDRESS)

    useEffect(() => {
        if (isError) toast.error((error as any).shortMessage)
    }, [isError, error])

    return (
        <Button
            className={`mt-3 w-full ${isLoading || isSuccess ? 'orangeDisabled' : ''}`}
            color="orange"
            disabled={isLoading}
            onClick={() => {
                write && write()
            }}
        >
            {isLoading && 'Loading...'}
            {isSuccess && 'Claim success!'}
            {!isSuccess && !isLoading && `Claim ${props.amount} now!`}
        </Button>
    )
}

const Dapp = () => {
    const { address, chain } = useAccount()

    const { data: amountLeft, isLoading: amountLeftLoading } = useReadContract({
        address: DISBURSER_ADDRESS,
        chainId: chain?.id,
        abi,
        functionName: 'amountLeft',
        args: [address],
    })

    const { data: paidOut, isLoading: paidOutLoading } = useReadContract({
        address: DISBURSER_ADDRESS,
        chainId: chain?.id,
        abi,
        functionName: 'paidOutAmounts',
        args: [address],
    })

    const { data: timeUntilNextClaim } = useReadContract({
        address: DISBURSER_ADDRESS,
        chainId: chain?.id,
        abi,
        functionName: 'timeLeftUntilNextClaim',
        args: [address],
        query: {
            select: (data: bigint) => data,
        },
    })

    const { data: claimEstimate, isLoading: claimEstimateLoading } = useReadContract({
        address: DISBURSER_ADDRESS,
        chainId: chain?.id,
        abi,
        functionName: 'claimEstimate',
        account: address,
        query: {
            select: (data: [bigint, bigint, bigint, boolean]) => ({
                claimable: data[0],
                missedPayouts: data[1],
                currentBalance: data[2],
                lastClaim: data[3],
            }),
        },
    })

    const claimableAmount = claimEstimateLoading ? 0 : `${toReadableNumber(claimEstimate?.claimable, 18)}`

    const amountLeftStr = amountLeftLoading
        ? '...'
        : `${(parseInt(amountLeft as string) / Math.pow(10, 18)).toFixed(4)}`
    const amountClaimedStr = paidOutLoading ? '...' : `${(parseInt(paidOut as string) / Math.pow(10, 18)).toFixed(4)}`

    return (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-activeblue bg-dark p-3">
                    <h2 className="text-2xl font-bold">Claimed</h2>
                    <div className="mt-3 text-xl">{amountClaimedStr} DGNX</div>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-activeblue bg-dark p-3">
                    <h2 className="text-2xl font-bold">Left to claim</h2>
                    <div className="mt-3 text-xl">{amountLeftStr} DGNX</div>
                </div>
            </div>
            <div className="mt-6 flex w-full items-center justify-center">
                {timeUntilNextClaim && timeUntilNextClaim > 0 ? (
                    <Button className="mt-3 w-full" color="orangeDisabled">
                        <Countdown seconds={Number(timeUntilNextClaim)} />
                    </Button>
                ) : (
                    <ClaimButton amount={claimableAmount} />
                )}
            </div>
        </>
    )
}

export const DisburserApp = (props: RouteObject) => {
    const { address, isConnected, chain } = useAccount()
    const { data: hasAmountLeft, isLoading } = useReadContract({
        address: DISBURSER_ADDRESS,
        abi,
        chainId: chain?.id,
        functionName: 'hasAmountLeft',
        args: [address],
    })

    return (
        <>
            {!isConnected && <div className="font-bold">Please connect wallet</div>}
            {isLoading && (
                <div className="flex w-full items-center justify-center">
                    <Spinner />
                </div>
            )}
            {hasAmountLeft && <Dapp />}
            {isConnected && !isLoading && !hasAmountLeft && (
                <div>
                    Unfortunately you don&apos;t have a claim on the legacy disburser (anymore). <br />
                    If this is not the case, you may want to check if you&apos;re connected with the desired wallet.
                </div>
            )}
            <ToastContainer />
        </>
    )
}
