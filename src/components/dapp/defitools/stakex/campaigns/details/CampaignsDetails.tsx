import { Spinner } from '@dappelements/Spinner'
import { toReadableNumber } from '@dapphelpers/number'
import { useERC20Approve } from '@dapphooks/shared/useERC20Approve'
import { useGetERC20BalanceOf } from '@dapphooks/shared/useGetERC20BalanceOf'
import { useHasERC20Allowance } from '@dapphooks/shared/useHasERC20Allowance'
import { useCampaignsGetCampaignData } from '@dapphooks/staking/useCampaignsGetCampaignData'
import { useClaim } from '@dapphooks/staking/useClaim'
import { useDepositStake } from '@dapphooks/staking/useDepositStake'
import { useGetContractOwner } from '@dapphooks/staking/useGetContractOwner'
import { useGetRewardEstimationForTokens } from '@dapphooks/staking/useGetRewardEstimationForTokens'
import { useGetStakes } from '@dapphooks/staking/useGetStakes'
import { usePaymentGetFeeInNative } from '@dapphooks/staking/usePaymentGetFeeInNative'
import { usePeripheryGet } from '@dapphooks/staking/usePeripheryGet'
import { useWithdraw } from '@dapphooks/staking/useWithdraw'
import { NumberIncreaser } from '@dappshared/NumberIncreaser'
import { Tile } from '@dappshared/Tile'
import { StakeResponse } from '@dapptypes'
import { Field, Input } from '@headlessui/react'
import clsx from 'clsx'
import { isUndefined } from 'lodash'
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import Countdown from 'react-countdown'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getChainById, getExplorerByChainId } from 'shared/supportedChains'
import { Button } from 'src/components/Button'
import { CustomConnectedButton } from 'src/components/dapp/CustomConnectButton'
import { Address, formatUnits, parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import logoSmall from './../../../../../../images/degenx_logo_small_bg_pattern.png'

export const CampaignsDetails = () => {
    const params = useParams()
    const protocolAddress = params.protocolAddress as Address
    const chainId = Number(params.chainId)
    const campaignId = params.campaignId as Address

    const { address, isConnected, chain } = useAccount()

    ///
    /// Campaign Data
    ///
    const { data: dataOwner } = useGetContractOwner(protocolAddress, chainId)
    const { data, isLoading, refetch } = useCampaignsGetCampaignData(protocolAddress, chainId, campaignId)
    const {
        data: dataBalanceOfStaking,
        isLoading: isLoadingBalanceOfStaking,
        refetch: refetchBalanceOfStaking,
    } = useGetERC20BalanceOf(data?.stats.stakingToken.source!, address!, chainId)

    ///
    /// Images
    ///
    const { response: dataPeriphery } = usePeripheryGet(protocolAddress, chainId)

    ///
    /// Deposit Stake
    ///
    const amountRef = useRef<HTMLElement>(null)
    const [amountEntered, setAmountEntered] = useState<string>('')
    const [amount, setAmount] = useState<bigint>(0n)
    const [errorMessage, setErrorMessage] = useState<string>()

    const onChangeAmount = (_event: ChangeEvent<HTMLInputElement>) => {
        _event.preventDefault()
        setAmountEntered(_event.target.value)
    }

    useEffect(() => {
        if (data && Boolean(dataBalanceOfStaking && amountEntered)) {
            const amountEnteredBN = parseUnits(amountEntered, Number(data.stats.stakingToken.decimals))
            const checkAmountEntered = formatUnits(amountEnteredBN, Number(data.stats.stakingToken.decimals))

            if (amountEntered != checkAmountEntered) {
                setAmount(0n)
                setErrorMessage(`Invalid Amount`)
                return
            }

            if (dataBalanceOfStaking! - amountEnteredBN < 0n) {
                setAmount(0n)
                setErrorMessage(`Insufficient ${data.stats.stakingToken.symbol} balance`)
                return
            } else {
                setAmount(amountEnteredBN)
                setErrorMessage(undefined)
            }
        }

        if (!amountEntered) {
            setAmount(0n)
            setErrorMessage(undefined)
        }
    }, [dataBalanceOfStaking, amountEntered, data])

    ///
    /// Current Stake
    ///
    const { data: dataStakes, refetch: refetchStakes } = useGetStakes(protocolAddress, chainId, address!, true)
    const [stake, setStake] = useState<StakeResponse>()
    useEffect(() => {
        if (!dataStakes || !dataStakes.length) setStake(undefined)
        else dataStakes.forEach((stakeResponse) => stakeResponse.bucketId === campaignId && setStake(stakeResponse))
    }, [dataStakes, campaignId])

    ///
    /// Stake Tokens
    ///
    const { data: dataFee, refetch: refetchFee } = usePaymentGetFeeInNative(protocolAddress, chainId)
    const { data: dataAllowance, refetch: refetchAllowance } = useHasERC20Allowance(
        data?.stats.stakingToken.source!,
        address!,
        protocolAddress,
        chainId
    )
    const {
        write: writeApprove,
        error: errorApprove,
        reset: resetApprove,
        isLoading: isLoadingApprove,
        isPending: isPendingApprove,
        isSuccess: isSuccessApprove,
    } = useERC20Approve(data?.stats.stakingToken.source!, protocolAddress, amount, chainId)
    const {
        write: writeDepositStake,
        error: errorDepositStake,
        reset: resetDepositStake,
        isLoading: isLoadingDepositStake,
        isPending: isPendingDepositStake,
        isSuccess: isSuccessDepositStake,
    } = useDepositStake(
        protocolAddress,
        chainId,
        campaignId,
        amount,
        Boolean(
            dataAllowance &&
                dataAllowance >= amount &&
                campaignId &&
                dataFee &&
                dataFee.thresholdFee > 0n &&
                amount > 0n
        ),
        true,
        dataFee?.thresholdFee!
    )

    const onClickDeposit = useCallback(() => {
        resetDepositStake()
        if (dataAllowance && dataAllowance >= amount) writeDepositStake && writeDepositStake()
        else writeApprove && writeApprove()
    }, [dataAllowance, writeDepositStake, writeApprove, amount, resetDepositStake])

    useEffect(() => {
        if (!isPendingApprove && isSuccessApprove) {
            if (dataAllowance && dataAllowance >= amount) writeDepositStake && writeDepositStake()
            else refetchAllowance && refetchAllowance()
        }
    }, [isPendingApprove, isSuccessApprove, dataAllowance, amount, writeDepositStake, refetchAllowance])

    useEffect(() => {
        if (isSuccessDepositStake) {
            refetch && refetch()
            refetchStakes && refetchStakes()
            refetchAllowance && refetchAllowance()
            refetchBalanceOfStaking && refetchBalanceOfStaking()
            resetApprove && resetApprove()
            resetDepositStake && resetDepositStake()
            data &&
                toast.success(
                    `Successfully deposited ${toReadableNumber(amount, data.stats.stakingToken.decimals)} ${
                        data.stats.stakingToken.symbol
                    }`,
                    { toastId: 'deposit' }
                )
            setAmountEntered('')
        }
    }, [
        isSuccessDepositStake,
        refetch,
        refetchStakes,
        resetApprove,
        resetDepositStake,
        refetchAllowance,
        refetchBalanceOfStaking,
        data,
        amount,
    ])

    useEffect(() => {
        if (errorApprove || errorDepositStake) {
            if (errorApprove) toast.error((errorApprove as any).cause.shortMessage)
            if (errorDepositStake) toast.error((errorDepositStake as any).cause.shortMessage)
            resetApprove()
            resetDepositStake()
        }
    }, [errorApprove, errorDepositStake, resetApprove, resetDepositStake])

    ///
    /// Withdraw
    ///
    const {
        write: writeWithdraw,
        isLoading: isLoadingWithdraw,
        isPending: isPendingWithdraw,
        isSuccess: isSuccessWithdraw,
        reset: resetWithdraw,
        claimedAmount,
        withdrawnAmount,
    } = useWithdraw(
        protocolAddress,
        chainId,
        stake?.tokenId!,
        data?.stats.rewardToken.source!,
        true,
        dataFee?.thresholdFee!,
        Boolean(stake && stake.tokenId && data && dataFee)
    )

    const onClickWithdraw = useCallback(() => {
        writeWithdraw && writeWithdraw()
    }, [writeWithdraw])

    useEffect(() => {
        if (isSuccessWithdraw) {
            refetch && refetch()
            refetchStakes && refetchStakes()
            refetchAllowance && refetchAllowance()
            refetchBalanceOfStaking && refetchBalanceOfStaking()
            resetWithdraw && resetWithdraw()
            data &&
                toast.success(
                    `Successfully withdrawn ${toReadableNumber(withdrawnAmount, data.stats.stakingToken.decimals)} ${
                        data.stats.stakingToken.symbol
                    }`,
                    { toastId: 'withdraw' }
                )
        }
    }, [
        isSuccessWithdraw,
        refetch,
        refetchStakes,
        refetchAllowance,
        refetchBalanceOfStaking,
        data,
        claimedAmount,
        withdrawnAmount,
        resetWithdraw,
    ])

    ///
    /// Rewards & Claim
    ///
    const { data: dataRewardEstimation, refetch: refetchRewardEstimation } = useGetRewardEstimationForTokens(
        protocolAddress,
        chainId,
        [stake?.tokenId!],
        data?.stats.rewardToken.source!
    )
    const {
        write: writeClaim,
        isLoading: isLoadingClaim,
        isPending: isPendingClaim,
        isSuccess: isSuccessClaim,
        reset: resetClaim,
        rewardAmount,
    } = useClaim(
        protocolAddress,
        chainId,
        stake?.tokenId!,
        data?.stats.rewardToken.source!,
        data?.stats.isRunning!,
        true,
        dataFee?.thresholdFee!
    )

    const onClickClaim = useCallback(() => {
        writeClaim && writeClaim()
    }, [writeClaim])

    useEffect(() => {
        if (isSuccessClaim) {
            refetch && refetch()
            refetchStakes && refetchStakes()
            refetchBalanceOfStaking && refetchBalanceOfStaking()
            refetchRewardEstimation && refetchRewardEstimation()
            resetClaim && resetClaim()
            dataRewardEstimation &&
                toast.success(
                    `Successfully claimed ${toReadableNumber(
                        rewardAmount,
                        dataRewardEstimation[0].tokenInfo.decimals
                    )} ${dataRewardEstimation[0].tokenInfo.symbol}`,
                    { toastId: 'claim' }
                )
        }
    }, [
        isSuccessClaim,
        refetch,
        refetchStakes,
        refetchBalanceOfStaking,
        refetchRewardEstimation,
        rewardAmount,
        resetClaim,
        dataRewardEstimation,
    ])

    const getBuyLink = useCallback(() => {
        return `https://app.debridge.finance/?address=&inputChain=${chainId}&outputChain=${chainId}&inputCurrency=0x0000000000000000000000000000000000000000&outputCurrency=${data?.stats.stakingToken.source}&r=30661&amount=1&dlnMode=simple`
    }, [chainId, data])

    ///
    return !data || isLoading ? (
        <div>Loading</div>
    ) : (
        <div className="mb-8 flex flex-col items-center gap-8">
            <Tile className="mb-12 w-full max-w-7xl !p-0">
                <div
                    className={clsx([
                        'relative flex h-[350px] w-full flex-col items-center justify-end gap-8 bg-gradient-to-tl from-dapp-cyan-500/40 bg-center sm:rounded-lg',
                        dataPeriphery &&
                            dataPeriphery.data &&
                            dataPeriphery.data.heroBannerUrl &&
                            'bg-cover bg-no-repeat',
                    ])}
                    style={{
                        backgroundImage:
                            dataPeriphery && dataPeriphery.data && dataPeriphery.data.heroBannerUrl
                                ? `radial-gradient(circle at center, #00000000 , #00000088), url(${dataPeriphery.data.heroBannerUrl})`
                                : `radial-gradient(circle at center, #00000000 , #00000088), url('${logoSmall.src}')`,
                    }}
                >
                    <div
                        className={clsx([
                            '-mb-12 flex size-24 flex-row items-center justify-center rounded-full bg-dapp-blue-800 bg-contain bg-center bg-no-repeat shadow-md shadow-dapp-blue-800',
                        ])}
                        style={
                            dataPeriphery && dataPeriphery.data && dataPeriphery.data.projectLogoUrl
                                ? {
                                      backgroundImage: `url('${dataPeriphery.data.projectLogoUrl}')`,
                                  }
                                : {}
                        }
                    >
                        {dataPeriphery && !dataPeriphery.data.projectLogoUrl && (
                            <span className="text-4xl font-bold">{data.stats.stakingToken.symbol[0]}</span>
                        )}
                    </div>
                    <div className="absolute top-0 w-full bg-dapp-blue-600/90 sm:rounded-t-lg">
                        <div className="flex flex-col items-center gap-4 p-4">
                            <span className="flex flex-col items-center text-3xl leading-8">
                                <span className="font-bold">Stake your {data.stats.stakingToken.symbol}</span>
                                <span className="text-xl">and earn a high APY in {data.stats.rewardToken.symbol}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </Tile>

            <div className="m-auto flex w-full max-w-3xl flex-col gap-8">
                {data &&
                    dataRewardEstimation &&
                    stake &&
                    (data.stats.isOpen || data.stats.isRunning || data.stats.isFinished) && (
                        <Tile className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2 overflow-hidden rounded-lg ">
                                <span className="text-xl">Your earned {data?.stats.rewardToken.symbol} rewards</span>
                                <span className="text-3xl">
                                    {data.stats.isRunning ? (
                                        <NumberIncreaser
                                            startNumber={dataRewardEstimation[0].amount}
                                            endNumber={
                                                (data.config.initialRewardAmount * stake.amount) / data.stats.staked
                                            }
                                            decimals={data.stats.rewardToken.decimals}
                                            duration={BigInt(data.stats.timeLeft)}
                                            fractionDigits={6}
                                        />
                                    ) : (
                                        'waiting for start...'
                                    )}
                                </span>
                            </div>
                            {data && (data.stats.isOpen || data.stats.isFinished) && stake && stake.amount > 0 && (
                                <Button
                                    disabled={isLoadingWithdraw || isPendingWithdraw}
                                    variant="primary"
                                    onClick={() => onClickWithdraw()}
                                    className="w-full"
                                >
                                    {isLoadingWithdraw || isPendingWithdraw ? (
                                        <span className="flex flex-row items-center gap-2">
                                            <Spinner theme="dark" />
                                            {isPendingWithdraw
                                                ? 'Please confirm withdraw'
                                                : isLoadingWithdraw && 'Processing Transaction'}
                                        </span>
                                    ) : data.stats.isFinished ? (
                                        'Withdraw Stake & Claim Rewards'
                                    ) : (
                                        'Withdraw Stake'
                                    )}
                                </Button>
                            )}

                            {data.stats.isRunning && dataRewardEstimation && dataRewardEstimation[0].amount && (
                                <Button
                                    disabled={isLoadingClaim || isLoadingClaim}
                                    variant="primary"
                                    onClick={() => onClickClaim()}
                                    className="w-full"
                                >
                                    {isLoadingClaim || isPendingClaim ? (
                                        <span className="flex flex-row items-center gap-2">
                                            <Spinner theme="dark" />
                                            {isPendingWithdraw
                                                ? 'Please confirm claim'
                                                : isLoadingWithdraw && 'Processing Transaction'}
                                        </span>
                                    ) : (
                                        'Claim Rewards'
                                    )}
                                </Button>
                            )}
                        </Tile>
                    )}

                <Tile className="flex flex-col gap-4 sm:gap-8">
                    {address && (
                        <div className="grid grid-cols-2 overflow-hidden rounded-lg">
                            <div className="flex flex-col justify-center bg-dapp-blue-400 p-4 font-bold">
                                Your Stake
                            </div>
                            <div className="break-all bg-dapp-blue-200 p-4 text-center text-xl font-bold">
                                {toReadableNumber(stake ? stake.amount : 0, data?.stats.stakingToken.decimals, {
                                    minimumFractionDigits: 3,
                                    maximumFractionDigits: 6,
                                })}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 overflow-hidden rounded-lg">
                        <div className="flex flex-col justify-center bg-dapp-blue-400 p-4 font-bold">
                            {data.stats.isOpen && 'Current'} APY
                        </div>
                        <div className="bg-dapp-blue-200 p-4 text-center text-xl font-bold">
                            {data && data.stats.rewardToken.source == data.stats.stakingToken.source
                                ? `${toReadableNumber(
                                      ((1 + Number(data?.stats.apr) / 10000 / (365 / (data?.config.period / 86400))) **
                                          (365 / (data?.config.period / 86400)) -
                                          1) *
                                          100,
                                      0,
                                      { maximumFractionDigits: 3 }
                                  )}%`
                                : 'not available'}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 overflow-hidden rounded-lg">
                        <div className="flex flex-col justify-center bg-dapp-blue-400 p-4 font-bold">Duration</div>
                        <div className="bg-dapp-blue-200 p-4 text-center text-xl font-bold">
                            {data?.config.period / 86400} day(s)
                        </div>
                    </div>
                    <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-green-400">
                        <div className="bg-dapp-blue-400/80 p-4 font-bold">Status</div>
                        <div className="bg-dapp-blue-200/80 p-4 text-center font-bold">
                            {!data.stats.isOpen && !data.stats.isRunning && !data.stats.isFinished && (
                                <span className="text-gray-400">Upcoming</span>
                            )}
                            {data.stats.isOpen && <span className="text-green-500">Open For Deposit</span>}
                            {data.stats.isRunning && <span className="text-green-500">Running</span>}
                            {data.stats.isFinished && (
                                <span className="text-green-500">🏁 &nbsp; Finished &nbsp; 🏁</span>
                            )}
                        </div>
                    </div>
                    {data && data.stats.isOpen && (
                        <div className="flex flex-col items-center justify-center gap-2 overflow-hidden rounded-lg bg-dapp-blue-400 p-4 text-base">
                            {!isConnected ? (
                                <CustomConnectedButton>Connect your wallet</CustomConnectedButton>
                            ) : isLoadingBalanceOfStaking || isUndefined(dataBalanceOfStaking) ? (
                                <div>
                                    <Spinner theme="dark" />
                                    <span>Checking {data.stats.stakingToken.symbol} balance</span>
                                </div>
                            ) : dataBalanceOfStaking == 0n ? (
                                <div className="flex flex-col gap-2 text-center">
                                    <span className="font-bold">
                                        Your wallet doesn&apos;t have any {data.stats.stakingToken.symbol}.
                                    </span>
                                    {chain && !chain.testnet && (
                                        <>
                                            <span className="text-sm">
                                                Please check if you&apos;re connected with the correct wallet
                                            </span>
                                            <span className="text-sm">or</span>
                                            <a
                                                href={getBuyLink()}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-2 rounded-lg bg-dapp-cyan-500 p-2 font-bold text-dapp-blue-800 motion-safe:animate-bounce"
                                            >
                                                Buy {data.stats.stakingToken.symbol} via deBridge
                                            </a>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex w-full flex-col gap-2 text-center">
                                    <Field>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            autoComplete="off"
                                            value={amountEntered}
                                            onChange={onChangeAmount}
                                            onWheel={(e) => e.currentTarget.blur()}
                                            className="mt-2 w-full rounded-lg border-0 bg-dapp-blue-800 text-left text-2xl leading-10 [appearance:textfield] focus:ring-0 focus:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            ref={amountRef}
                                        />
                                        <span className="mt-2 flex items-center gap-2 text-xs/8 text-dapp-cyan-50/50">
                                            Available:{' '}
                                            {toReadableNumber(dataBalanceOfStaking, data.stats.stakingToken.decimals)}{' '}
                                            {data.stats.stakingToken.symbol}
                                        </span>
                                    </Field>
                                    <Button
                                        variant={Boolean(errorMessage) ? 'error' : 'primary'}
                                        disabled={Boolean(errorMessage)}
                                        onClick={onClickDeposit}
                                        className="w-full"
                                    >
                                        {(isLoadingApprove ||
                                            isLoadingDepositStake ||
                                            isPendingDepositStake ||
                                            isPendingApprove) && (
                                            <span className="flex flex-row items-center gap-2">
                                                <Spinner theme="dark" />
                                                {isPendingApprove
                                                    ? 'Please approve amount'
                                                    : isPendingDepositStake
                                                    ? 'Please confirm deposit'
                                                    : (isLoadingApprove || isLoadingDepositStake) &&
                                                      'Processing Transaction'}
                                            </span>
                                        )}
                                        {errorMessage}
                                        {!errorMessage &&
                                            !isPendingDepositStake &&
                                            !isPendingApprove &&
                                            !isLoadingApprove &&
                                            !isLoadingDepositStake &&
                                            `Deposit ${data.stats.stakingToken.symbol}`}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </Tile>
                <Tile className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 overflow-hidden rounded-lg ">
                        <span className="text-xl">Staking Token</span>
                        <span className="text-3xl">
                            {data?.stats.rewardToken.name} | {data?.stats.rewardToken.symbol}
                        </span>
                        <span className="text-sm underline opacity-50">
                            <a
                                href={getExplorerByChainId(chainId)?.getTokenUrl(data.stats.stakingToken.source)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {data.stats.stakingToken.source}
                            </a>
                        </span>
                    </div>
                </Tile>

                <Tile className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 overflow-hidden rounded-lg ">
                        <span className="text-xl">Total {data?.stats.stakingToken.symbol} staked</span>
                        <span className="text-3xl">
                            {toReadableNumber(data ? data.stats.staked : 0, data?.stats.stakingToken.decimals, {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 6,
                            })}
                        </span>
                    </div>
                </Tile>

                <Tile className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 overflow-hidden rounded-lg ">
                        <span className="text-xl">Total {data.stats.rewardToken.symbol} Rewards Locked</span>
                        <span className="text-3xl">
                            {toReadableNumber(data.config.initialRewardAmount, data.stats.rewardToken.decimals, {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 6,
                            })}
                        </span>
                    </div>
                </Tile>

                <Tile className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 overflow-hidden rounded-lg ">
                        <span className="text-xl">Total {data?.stats.stakingToken.symbol} rewarded</span>
                        {data && !data.stats.isRunning ? (
                            <span className="text-3xl">
                                {toReadableNumber(data?.config.initialRewardAmount, data?.stats.stakingToken.decimals, {
                                    minimumFractionDigits: 3,
                                    maximumFractionDigits: 6,
                                })}
                            </span>
                        ) : (
                            <span className="text-3xl">
                                <NumberIncreaser
                                    startNumber={
                                        (data.config.initialRewardAmount *
                                            (BigInt(data.config.period) - data.stats.timeLeft)) /
                                        BigInt(data.config.period)
                                    }
                                    endNumber={data.config.initialRewardAmount}
                                    decimals={data.stats.rewardToken.decimals}
                                    duration={BigInt(data.stats.timeLeft)}
                                    fractionDigits={6}
                                />
                            </span>
                        )}
                    </div>
                </Tile>

                {data && data.stats.isRunning && (
                    <Tile className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2 overflow-hidden rounded-lg ">
                            <span className="text-xl">Ends in</span>
                            <span className="text-3xl">
                                <Countdown
                                    zeroPadDays={2}
                                    zeroPadTime={2}
                                    date={
                                        (Number(data.config.startTimestamp) +
                                            (data.config.period -
                                                (Number(data.stats.currentTimestamp) -
                                                    Number(data.config.startTimestamp)))) *
                                        1000
                                    }
                                    renderer={({ days, hours, minutes, seconds }) => (
                                        <span className="tabular-nums">
                                            {days}d {hours.toString().padStart(2, '0')}h{' '}
                                            {minutes.toString().padStart(2, '0')}m {seconds.toString().padStart(2, '0')}
                                            s
                                        </span>
                                    )}
                                />
                            </span>
                        </div>
                    </Tile>
                )}
            </div>

            <div className="text-center text-sm opacity-50">
                <div className="text-[8px] leading-4">
                    Protocol: {protocolAddress}
                    <br />
                    Campaign: {campaignId}
                    <br />
                    Network: {getChainById(chainId).name}
                </div>
                {isConnected && dataOwner && address == dataOwner && (
                    <Link to={`./../../../../manage/${chainId}/${protocolAddress}`}>Manage Campaign</Link>
                )}
            </div>
        </div>
    )
}
