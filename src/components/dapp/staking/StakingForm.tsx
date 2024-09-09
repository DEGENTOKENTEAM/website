import { toReadableNumber } from '@dapphelpers/number'
import { durationFromSeconds, StakeXContext } from '@dapphelpers/staking'
import { useERC20Approve } from '@dapphooks/shared/useERC20Approve'
import { useGetERC20BalanceOf } from '@dapphooks/shared/useGetERC20BalanceOf'
import { useHasERC20Allowance } from '@dapphooks/shared/useHasERC20Allowance'
import { useDepositStake } from '@dapphooks/staking/useDepositStake'
import { useGetFeeFor } from '@dapphooks/staking/useGetFee'
import { useGetMultipliersPerOneStakingToken } from '@dapphooks/staking/useGetMultipliersPerOneStakingToken'
import { useGetStakeBuckets } from '@dapphooks/staking/useGetStakeBuckets'
import { useHasFees } from '@dapphooks/staking/useHasFees'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { StakeBucket, StakingBaseProps } from '@dapptypes'
import { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { MdError, MdLockOpen, MdLockOutline } from 'react-icons/md'
import { SpinnerCircular } from 'spinners-react'
import { Address, formatUnits, parseUnits, toHex } from 'viem'
import { useAccount } from 'wagmi'
import { Button } from '../../Button'
import { Spinner } from '../elements/Spinner'
import { BaseOverlay } from '../shared/overlays/BaseOverlay'
import { StakeBucketButton, StakingDurationSelection } from './StakingDurationSelection'

type StakingFormProps = {
    onDepositSuccessHandler: () => void
} & StakingBaseProps

export const StakingForm = ({ stakingTokenInfo, onDepositSuccessHandler }: StakingFormProps) => {
    const defaultBucketId = toHex('boss mode', { size: 32 })

    const {
        data: { protocol, chain },
    } = useContext(StakeXContext)

    const { address, isConnected, isDisconnected, chainId } = useAccount()

    // informative data (permanent)
    const [tokenSymbol, setTokenSymbol] = useState<string>()
    const [tokenBalance, setTokenBalance] = useState(0)
    const [durationButtons, setDurationButtons] = useState<StakeBucketButton[]>() // prettier-ignore
    const [multiplierPerToken, setMultiplierPerToken] = useState<any>() // prettier-ignore

    // primary data
    const [stakeAmount, setStakeAmount] = useState<bigint>(0n)
    const [stakeBucketId, setStakeBucketId] = useState<Address>(defaultBucketId)
    const [stakeBucketChecked, setStakeBucketChecked] = useState(false) // prettier-ignore

    // needed for data in the info box
    const [selectedStake, setSelectedStake] = useState<StakeBucket>()

    // peripheral data
    const [tokenBalanceRaw, setTokenBalanceRaw] = useState('')
    const [stakingTokenBalance, setStakingTokenBalance] = useState<bigint>(0n)
    const [stakeAmountEntered, setStakeAmountEntered] = useState<string>('')

    // form error
    const [hasError, setHasError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [hasAllowance, setHasAllowance] = useState(false) // allowance is good
    const [isDepositButtonEnabled, setIsDepositButtonEnabled] = useState(false)
    const [startDeposit, setStartDeposit] = useState(false) // show static overlay if true

    //
    // Hooks
    //
    // base data hooks
    const { data: dataStakeBuckets } = useGetStakeBuckets(protocol, chain?.id!)
    const { data: dataMultiplierPerToken } = useGetMultipliersPerOneStakingToken(protocol, chain?.id!)
    const { data: dataBalanceOf } = useGetERC20BalanceOf(stakingTokenInfo?.source, address!, chain?.id!)
    const {
        data: dataAllowance,
        refetch: refetchERC20Allowance,
        isLoading: isLoadingERC20Allowance,
    } = useHasERC20Allowance(stakingTokenInfo?.source, address!, protocol, chain?.id!, true)
    const { data: dataHasFees } = useHasFees(protocol, chain?.id!)
    const { data: feeForStaking } = useGetFeeFor(protocol, chain?.id!, 'staking', stakeAmount)

    // interactive hooks
    const {
        isPending: isLoadingERC20Approve,
        isSuccess: isSuccessERC20Approve,
        write: writeERC20Approve,
        reset: resetERC20Approve,
        isError: isErrorERC20Approve,
        error: errorERC20Approve,
    } = useERC20Approve(stakingTokenInfo?.source, protocol, stakeAmount, chain?.id!)

    const {
        isLoading: isLoadingDepositStake,
        isSuccess: isSuccessDepositStake,
        write: writeDepositStake,
        reset: resetDepositStake,
        isError: isErrorDepositStake,
        error: errorDepositStake,
        feeAmount: feeAmountDepositStake,
        stakeAmount: stakeAmountDepositStake,
        hash: hashDepositStake,
    } = useDepositStake(protocol, chain?.id!, stakeBucketId, stakeAmount, Boolean(hasAllowance && startDeposit))

    //
    // Handlers
    //

    // duration is selected
    const onDurationSelectionHandler = (duration: StakeBucketButton | null) =>
        setStakeBucketId((duration?.id as Address) || defaultBucketId)

    // checkbox is checked
    const onCheckboxHandler = (checked: boolean) => setStakeBucketChecked(checked)

    // amount is entered
    const onChangeHandler = (_event: ChangeEvent<HTMLInputElement>) => {
        _event.preventDefault()
        setStakeAmountEntered(_event.target.value)
        refetchERC20Allowance()
    }

    // deposit button has been clicked
    const onClickHandler = useCallback(() => {
        resetDepositStake()
        resetERC20Approve()
        setStartDeposit(true)
        if (hasAllowance) writeDepositStake && writeDepositStake()
        else writeERC20Approve && writeERC20Approve()
    }, [resetERC20Approve, resetDepositStake, writeERC20Approve, writeDepositStake, hasAllowance])

    const onStaticOverlayCloseHandler = () => {
        resetAfterDeposit()
    }

    const onClickTryAgainButtonHandler = () => {
        resetERC20Approve()
        resetDepositStake()
    }

    const onClickCancelButtonHandler = () => {
        setStartDeposit(false)
        resetERC20Approve()
        resetDepositStake()
    }

    const onClickCloseButtonHandler = () => {
        resetAfterDeposit()
        onDepositSuccessHandler()
    }

    //
    // Errors
    //
    const setError = (message: string) => {
        setHasError(true)
        setErrorMessage(message)
    }

    const resetError = () => {
        setHasError(false)
        setErrorMessage('')
    }

    //z
    // reset for
    //
    const resetForm = useCallback(() => {
        setStakeAmountEntered('')
        setStakeBucketId(defaultBucketId)
        setStakeBucketChecked(false)
        resetERC20Approve()
        resetDepositStake()
    }, [defaultBucketId, resetERC20Approve, resetDepositStake])

    const resetAfterDeposit = () => {
        setStartDeposit(false)
        resetForm()
    }

    //
    // Effects
    //

    useEffect(() => {
        setIsDepositButtonEnabled(
            isConnected &&
                stakeBucketChecked &&
                stakeAmount > 0n &&
                stakeBucketId !== defaultBucketId &&
                !isLoadingERC20Allowance
        )
    }, [defaultBucketId, stakeAmount, stakeBucketId, stakeBucketChecked, isConnected, isLoadingERC20Allowance])

    // initiate deposit when conditions are met
    useEffect(() => {
        if (startDeposit && !isLoadingERC20Approve && isSuccessERC20Approve) {
            if (hasAllowance) writeDepositStake && writeDepositStake()
            else refetchERC20Allowance && refetchERC20Allowance()
        }
    }, [
        startDeposit,
        hasAllowance,
        isLoadingERC20Approve,
        isSuccessERC20Approve,
        writeDepositStake,
        refetchERC20Allowance,
    ])

    useEffect(() => {
        if (multiplierPerToken)
            setDurationButtons(
                dataStakeBuckets
                    ?.map(({ id, duration, burn, multiplier }) => ({
                        id,
                        multiplier,
                        duration,
                        burn,
                        selected: id === stakeBucketId,
                        multiplierPerToken: multiplierPerToken[id],
                    }))
                    .sort((a, b) => (a.multiplier < b.multiplier ? -1 : 1))
            )

        if (dataStakeBuckets && stakeBucketId) {
            setSelectedStake(dataStakeBuckets.find(({ id }) => id === stakeBucketId))
        }
    }, [dataStakeBuckets, stakeBucketId, multiplierPerToken])

    useEffect(() => {
        dataBalanceOf && setStakingTokenBalance(dataBalanceOf)
    }, [dataBalanceOf])

    useEffect(() => {
        dataMultiplierPerToken &&
            setMultiplierPerToken(
                dataMultiplierPerToken.reduce(
                    (acc, m) => ({
                        ...acc,
                        [m.bucketId as Address]: Math.floor(Number(m.multiplier) / m.divider),
                    }),
                    {}
                )
            )
    }, [dataMultiplierPerToken])

    // if wallet disconnects
    useEffect(() => {
        if (isDisconnected) {
            resetForm()
            setStartDeposit(false)
            setStakingTokenBalance(0n)
        }
    }, [isDisconnected, resetForm])

    // sets the general token balance
    useEffect(() => {
        if (stakingTokenBalance && stakingTokenInfo) {
            setTokenBalance(Number(stakingTokenBalance) / 10 ** Number(stakingTokenInfo.decimals))
            setTokenBalanceRaw(stakingTokenBalance.toString())
        }
    }, [stakingTokenBalance, stakingTokenInfo])

    // entered amount validation and throws error if necessary
    useEffect(() => {
        if (Boolean(stakeAmountEntered && tokenBalanceRaw && stakingTokenInfo)) {
            const tokenBalanceRawBN = BigInt(tokenBalanceRaw)
            const stakeAmountEnteredBN = parseUnits(stakeAmountEntered, parseInt(stakingTokenInfo.decimals.toString()))
            const checkAmountEntered = formatUnits(stakeAmountEnteredBN, parseInt(stakingTokenInfo.decimals.toString()))

            if (stakeAmountEntered != checkAmountEntered) {
                setStakeAmount(0n)
                setError(`Invalid number. Too many decimals`)
                return
            }

            if (tokenBalanceRawBN - stakeAmountEnteredBN < 0n) {
                setStakeAmount(0n)
                setError(`Balance not enough to stake ${stakeAmountEntered} ${stakingTokenInfo?.symbol}`)
                return
            } else {
                setStakeAmount(stakeAmountEnteredBN)
                resetError()
            }
        }

        // no entered amount, set stakeAmount to 0
        if (!stakeAmountEntered) setStakeAmount(0n)
    }, [tokenBalanceRaw, stakeAmountEntered, stakingTokenInfo])

    // set token symbol
    useEffect(() => stakingTokenInfo && setTokenSymbol(stakingTokenInfo?.symbol), [stakingTokenInfo])

    // set allowance
    useEffect(() => {
        dataAllowance && setHasAllowance(stakeAmount <= dataAllowance)
    }, [stakeAmount, dataAllowance])

    return (
        <div className="flex flex-col gap-8">
            <div className="text-sm">
                <div className="mb-2 px-1">
                    Deposit {tokenSymbol} &nbsp;&nbsp;{' '}
                    <span className="text-xs text-darkTextLowEmphasis">Balance: {tokenBalance.toLocaleString()}</span>
                </div>
                <div>
                    <input
                        autoFocus
                        type="number"
                        placeholder="0"
                        disabled={!isConnected}
                        value={stakeAmountEntered}
                        onChange={onChangeHandler}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full rounded-lg border-0 bg-dapp-blue-800 text-right text-2xl leading-10 [appearance:textfield] focus:ring-0 focus:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                </div>
                {hasError && <div className="mt-1 px-3 text-xs text-error">{errorMessage}</div>}
            </div>

            <StakingDurationSelection
                durations={durationButtons!}
                tokenSymbol={tokenSymbol!}
                isCheckboxSelected={stakeBucketChecked}
                onCheckbox={onCheckboxHandler}
                onDurationSelection={onDurationSelectionHandler}
            />

            <Button
                disabled={!isDepositButtonEnabled || startDeposit}
                className="w-full gap-2"
                variant="primary"
                color="lightBlue"
                onClick={onClickHandler}
            >
                {startDeposit && (
                    <>
                        <Spinner className="h-4 w-4" theme="dark" />
                        <span>processing...</span>
                    </>
                )}
                {!startDeposit && (
                    <>
                        <span>Deposit {tokenSymbol}</span>
                        {isDepositButtonEnabled && isConnected ? <MdLockOpen /> : <MdLockOutline />}
                    </>
                )}
            </Button>

            <StatsBoxTwoColumn.Wrapper className="rounded-lg bg-dapp-blue-800 px-5 py-2 text-sm">
                <StatsBoxTwoColumn.LeftColumn>{tokenSymbol}</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    {stakeAmountEntered ? stakeAmountEntered : '-'}
                </StatsBoxTwoColumn.RightColumn>

                {dataHasFees?.hasFeeForStaking && (
                    <>
                        <StatsBoxTwoColumn.LeftColumn>Deposit Fee in {tokenSymbol}</StatsBoxTwoColumn.LeftColumn>
                        <StatsBoxTwoColumn.RightColumn>
                            {toReadableNumber(feeForStaking?.feeAmount, stakingTokenInfo?.decimals)}
                        </StatsBoxTwoColumn.RightColumn>
                    </>
                )}

                <StatsBoxTwoColumn.LeftColumn>Reward Multiplier</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    {selectedStake ? `${selectedStake.multiplier}x` : '-'}
                </StatsBoxTwoColumn.RightColumn>

                <StatsBoxTwoColumn.LeftColumn>Multiplier per {tokenSymbol} in Pool</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    {multiplierPerToken && selectedStake && multiplierPerToken[selectedStake.id]
                        ? `${multiplierPerToken?.[selectedStake.id]}x`
                        : '-'}
                </StatsBoxTwoColumn.RightColumn>

                {/* <StatsBoxTwoColumn.LeftColumn>
                    Expected APY
                </StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    {stakeBucketId ? `${expectedApy}%` : '-'}
                </StatsBoxTwoColumn.RightColumn> */}

                <StatsBoxTwoColumn.LeftColumn>Stake Duration</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    {selectedStake ? (
                        !selectedStake.burn ? (
                            selectedStake.duration ? (
                                durationFromSeconds(selectedStake.duration, {
                                    long: true,
                                })
                            ) : (
                                'None'
                            )
                        ) : (
                            <span className="font-bold text-degenOrange">BURNED</span>
                        )
                    ) : (
                        '-'
                    )}
                </StatsBoxTwoColumn.RightColumn>

                <StatsBoxTwoColumn.LeftColumn>Est. Unlock Date</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    {selectedStake ? (
                        !selectedStake.burn ? (
                            `${new Date(Date.now() + selectedStake.duration * 1000).toLocaleDateString(
                                navigator.language,
                                {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                }
                            )}, ${new Date(Date.now() + selectedStake.duration * 1000).toLocaleTimeString(
                                navigator.language
                            )}`
                        ) : (
                            <span className="font-bold text-degenOrange">BURNED</span>
                        )
                    ) : (
                        '-'
                    )}
                </StatsBoxTwoColumn.RightColumn>
            </StatsBoxTwoColumn.Wrapper>

            {(startDeposit || isLoadingERC20Approve || isLoadingDepositStake) && (
                <BaseOverlay isOpen={startDeposit} closeOnBackdropClick={false} onClose={onStaticOverlayCloseHandler}>
                    <>
                        {(isErrorERC20Approve || isErrorDepositStake) && (
                            <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                                <MdError className="h-[100px] w-[100px] text-error " />
                                There was an error: <br />
                                {errorDepositStake && (errorDepositStake as any).details}
                                {errorERC20Approve && (errorERC20Approve as any).details}
                            </div>
                        )}

                        {!isSuccessDepositStake && !isErrorERC20Approve && !isErrorDepositStake && (
                            <div className="flex flex-col items-center gap-6 p-6 text-base">
                                <SpinnerCircular
                                    size={100}
                                    thickness={200}
                                    speed={50}
                                    color="#0F978E"
                                    secondaryColor="#DBEAE8"
                                />

                                {isLoadingERC20Approve && (
                                    <div className="text-center">
                                        Please <span className="font-bold">approve</span>
                                        , that we&apos;re allowed
                                        <br />
                                        to transfer{' '}
                                        <span className="font-bold">
                                            {stakeAmountEntered} {tokenSymbol}
                                        </span>{' '}
                                        from your account.
                                    </div>
                                )}

                                {isLoadingDepositStake && !hashDepositStake && (
                                    <div className="text-center">
                                        Please confirm to{' '}
                                        <span className="font-bold">
                                            deposit {stakeAmountEntered} {tokenSymbol}
                                        </span>{' '}
                                        into staking.
                                    </div>
                                )}

                                {isLoadingDepositStake && hashDepositStake && (
                                    <div className="text-center">Waiting for transaction to be processed...</div>
                                )}

                                {!hasAllowance && !isLoadingERC20Approve && !isLoadingDepositStake && (
                                    <div className="text-center">
                                        <span>checking allowance...</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {isSuccessDepositStake && (
                            <>
                                <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                                    <IoCheckmarkCircle className="h-[100px] w-[100px] text-success" />
                                    <span className="font-bold">
                                        Successfully deposited <br />
                                        <span className="text-xl font-bold">
                                            {toReadableNumber(stakeAmountDepositStake, stakingTokenInfo?.decimals)}{' '}
                                            {stakingTokenInfo?.symbol}
                                        </span>
                                        {typeof feeAmountDepositStake === 'bigint' && feeAmountDepositStake > 0n && (
                                            <>
                                                <br />
                                                <br />A fee of{' '}
                                                <span className="text-xl font-bold">
                                                    {toReadableNumber(
                                                        feeAmountDepositStake,
                                                        stakingTokenInfo?.decimals
                                                    )}{' '}
                                                    {stakingTokenInfo?.symbol}
                                                </span>{' '}
                                                has been charged from your staking amount
                                            </>
                                        )}
                                    </span>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={onClickCloseButtonHandler}
                                    className="mt-2 flex w-full items-center justify-center gap-2"
                                >
                                    Close
                                </Button>
                            </>
                        )}

                        {(isErrorERC20Approve || isErrorDepositStake) && (
                            <div>
                                <Button
                                    variant="primary"
                                    onClick={onClickTryAgainButtonHandler}
                                    className="mt-6 flex w-full items-center justify-center gap-2"
                                >
                                    Try again
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={onClickCancelButtonHandler}
                                    className="mt-2 flex w-full items-center justify-center gap-2"
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </>
                </BaseOverlay>
            )}
        </div>
    )
}
