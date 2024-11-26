import { toReadableNumber } from '@dapphelpers/number'
import { durationFromSeconds, StakeXContext } from '@dapphelpers/staking'
import { useGetMergingEstimation } from '@dapphooks/staking/useGetMergingEstimation'
import { useGetStakes } from '@dapphooks/staking/useGetStakes'
import { useMerge } from '@dapphooks/staking/useMerge'
import { CaretDivider } from '@dappshared/CaretDivider'
import { BaseOverlay, BaseOverlayProps } from '@dappshared/overlays/BaseOverlay'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { StakeResponse, TokenInfo, TokenInfoResponse } from '@dapptypes'
import { Checkbox, Field, Label } from '@headlessui/react'
import { Tooltip } from 'flowbite-react'
import { isBoolean, pick } from 'lodash'
import { useCallback, useContext, useEffect, useState } from 'react'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { FaArrowLeft } from 'react-icons/fa'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { MdError } from 'react-icons/md'
import { SpinnerCircular } from 'spinners-react'
import { Button } from 'src/components/Button'
import { Address } from 'viem'
import { useBlock } from 'wagmi'
import { Spinner } from '../../elements/Spinner'
import { StakingPayoutTokenSelection } from '../StakingPayoutTokenSelection'

type StakingMergeOverlayProps = {
    protocolAddress: Address
    chainId: number
    tokens: TokenInfoResponse[]
    stakingTokenInfo: TokenInfoResponse
    payoutTokenInfo: TokenInfo
    stakerAddress: Address
    stake: StakeResponse
} & BaseOverlayProps

export const StakingMergeOverlay = ({
    isOpen,
    onClose,
    tokens,
    protocolAddress,
    chainId,
    stakingTokenInfo,
    payoutTokenInfo,
    stakerAddress,
    stake,
}: StakingMergeOverlayProps) => {
    const { tokenId, bucketId } = stake as { tokenId: bigint; bucketId: Address }
    const { data: dataBlock, isLoading: isLoadingBlock, refetch: refreshBlock } = useBlock()
    const {
        data: { actionFeeActive, actionFeeThreshold },
    } = useContext(StakeXContext)

    //
    // Merge State
    //
    const [selectedTokenIds, setSelectedTokenIds] = useState<bigint[]>([tokenId])
    const [isCheckboxSelected, setIsCheckboxSelected] = useState(false)
    const [isSelectedAll, setIsSelectedAll] = useState(false)
    const [availableStakes, setAvailableStakes] = useState<StakeResponse[]>([stake])
    const [mergePossible, setMergePossible] = useState(false)

    //
    // Payout State
    //
    const [payoutToken, setPayoutToken] = useState<TokenInfo>(payoutTokenInfo)
    const [claimRewards, setClaimRewards] = useState(true)
    const [targetTokens, setTargetTokens] = useState<TokenInfoResponse[]>([])

    //
    // Merging & Estimations
    //
    const {
        data: dataMergingEstimation,
        isLoading: isLoadingMergingEstimation,
        refetch: refetchMergingEstimation,
    } = useGetMergingEstimation(
        protocolAddress,
        chainId,
        selectedTokenIds!,
        !claimRewards,
        bucketId!,
        payoutToken?.source
    )

    const { data: dataGetStakes, isLoading: isLoadingGetStakes } = useGetStakes(
        protocolAddress,
        chainId,
        stakerAddress,
        true
    )

    const {
        write,
        isLoading: isLoadingMerge,
        isSuccess: isSuccessMerge,
        isError: isError,
        error,
        reset,
        mergeAmount,
        feeAmount,
        claimedAmount,
        hash: hashUpstake,
    } = useMerge(
        mergePossible && Boolean(bucketId && payoutToken && payoutToken.source) && isBoolean(claimRewards),
        protocolAddress,
        chainId,
        selectedTokenIds!,
        !claimRewards,
        bucketId!,
        payoutToken.source,
        actionFeeActive,
        actionFeeThreshold
    )

    //
    // Handlers
    //
    const onClickHandler = useCallback(() => {
        write && write()
    }, [write])

    const onCloseHandler = () => {
        reset()
        onClose && onClose()
    }

    const onClickTryAgainButtonHandler = () => {
        reset()
        setSelectedTokenIds([])
        setIsCheckboxSelected(false)
    }

    const onClickCancelButtonHandler = () => {
        onCloseHandler()
    }

    const onClickCloseButtonHandler = () => {
        onCloseHandler()
    }

    const onClickPayoutHandler = (target: TokenInfoResponse) => {
        if (payoutToken?.source != target.source)
            setPayoutToken(pick(target, ['name', 'symbol', 'decimals', 'source']) as TokenInfo)
    }

    const onSelectToggleTokenId = (toggleTokenId: bigint) => {
        setSelectedTokenIds(
            selectedTokenIds.includes(toggleTokenId)
                ? selectedTokenIds.filter((selecetdTokenId) => selecetdTokenId != toggleTokenId)
                : [...selectedTokenIds, toggleTokenId]
        )
    }

    const onChangeSelectAll = useCallback(() => {
        setSelectedTokenIds(!isSelectedAll ? availableStakes.map((stake) => stake.tokenId) : [stake.tokenId])
    }, [isSelectedAll, availableStakes, stake.tokenId])

    //
    // Effects
    //

    //
    // Effects Payout Tokens
    //
    useEffect(() => {
        if (tokens && tokens.length > 0) {
            setTargetTokens(tokens.filter((token) => token.isTarget))
        } else setTargetTokens([])
    }, [tokens])

    useEffect(() => {
        if (selectedTokenIds && payoutToken) {
            refreshBlock && refreshBlock()
            refetchMergingEstimation && refetchMergingEstimation()
        }
    }, [selectedTokenIds, payoutToken, refreshBlock, refetchMergingEstimation])

    //
    // Effects Merging & Estimations
    //
    useEffect(() => {
        dataGetStakes &&
            dataGetStakes.length &&
            setAvailableStakes([
                stake,
                ...dataGetStakes.filter(
                    (dataStake) => dataStake.bucketId == bucketId && stake.tokenId !== dataStake.tokenId
                ),
            ])
    }, [dataGetStakes, bucketId, stake])

    useEffect(() => {
        setMergePossible(isCheckboxSelected && selectedTokenIds.length > 1)
        setIsSelectedAll(selectedTokenIds.length == availableStakes.length)
    }, [isCheckboxSelected, availableStakes, selectedTokenIds])

    return (
        <BaseOverlay isOpen={isOpen} closeOnBackdropClick={false} onClose={onCloseHandler}>
            {!tokens && (
                <div className="flex flex-row items-center justify-center">
                    <Spinner theme="dark" className="m-20 !h-24 !w-24" />
                </div>
            )}

            {tokens && !isLoadingMerge && !isSuccessMerge && !isError && (
                <>
                    <div className="flex flex-col gap-6 text-base">
                        <h3 className="flex flex-row items-center gap-3 text-xl">
                            <div className="font-title">Merge</div>
                            <div>
                                <Tooltip
                                    content={
                                        <span>
                                            This option will merge your selected stakes of a specific staking pool to a
                                            single stake in order to decrease the amount of stakes and increase the
                                            savings in gas to claim all your rewards
                                        </span>
                                    }
                                    className="bg-dapp-blue-50"
                                    placement="auto"
                                >
                                    <AiOutlineQuestionCircle data-tooltip-target="tooltip-default" />
                                </Tooltip>
                            </div>
                            <div className="flex grow justify-end">
                                <button
                                    type="button"
                                    className="flex items-center justify-end gap-1 text-xs"
                                    onClick={onCloseHandler}
                                >
                                    <FaArrowLeft className="size-3" />
                                    Back
                                </button>
                            </div>
                        </h3>

                        {targetTokens && payoutToken && (
                            <StakingPayoutTokenSelection
                                headline="Claiming Rewards"
                                description="Enable this option and select a payout token in order to claim your rewards in a specific payout token. Disable this option and your rewards will be added to the merge amount."
                                selectedToken={payoutToken}
                                tokens={targetTokens}
                                onSelect={onClickPayoutHandler}
                                isOptional={true}
                                isOptionalChecked={claimRewards}
                                onCheckboxChange={setClaimRewards}
                            />
                        )}

                        <StatsBoxTwoColumn.Wrapper className="rounded-lg bg-dapp-blue-800 px-4 py-2 text-sm">
                            <span className="col-span-2">Select stakes to merge</span>

                            <div className="col-span-2">
                                <CaretDivider />
                            </div>

                            <div className="col-span-2 max-h-96 overflow-y-auto">
                                <Field className="flex flex-row items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={isSelectedAll}
                                        onChange={onChangeSelectAll}
                                        className="size-4 group block shrink-0 rounded-sm border border-dapp-cyan-50 bg-transparent data-[checked]:border-dapp-cyan-500  data-[checked]:bg-dapp-cyan-500"
                                    >
                                        <svg
                                            className="stroke-white opacity-0 group-data-[checked]:opacity-100"
                                            viewBox="0 0 14 14"
                                            fill="none"
                                        >
                                            <path
                                                d="M3 8L6 11L11 3.5"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </Checkbox>
                                    <Label>Select all</Label>
                                </Field>
                                {availableStakes &&
                                    availableStakes.map((availableStake) => (
                                        <Field
                                            key={Number(availableStake.tokenId)}
                                            className="flex flex-row items-center gap-2 text-sm"
                                        >
                                            <Checkbox
                                                checked={selectedTokenIds.includes(availableStake.tokenId)}
                                                onChange={() => {
                                                    onSelectToggleTokenId(availableStake.tokenId)
                                                }}
                                                className="size-4 group block shrink-0 rounded-sm border bg-transparent data-[checked]:border-dapp-cyan-500  data-[checked]:bg-dapp-cyan-500"
                                            >
                                                <svg
                                                    className="stroke-white opacity-0 group-data-[checked]:opacity-100"
                                                    viewBox="0 0 14 14"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M3 8L6 11L11 3.5"
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </Checkbox>
                                            <Label className="grid w-full grid-cols-2">
                                                <span>{`NFT#${availableStake.tokenId}`}</span>
                                                <span className="text-right">
                                                    <span className="text-xs">{stakingTokenInfo.symbol}</span>{' '}
                                                    {toReadableNumber(availableStake.amount, stakingTokenInfo.decimals)}
                                                </span>
                                            </Label>
                                        </Field>
                                    ))}
                            </div>

                            <div className="col-span-2">
                                <CaretDivider color="cyan" />
                            </div>

                            <StatsBoxTwoColumn.LeftColumn>New Stake Estimate</StatsBoxTwoColumn.LeftColumn>
                            <StatsBoxTwoColumn.RightColumn>
                                {isLoadingMergingEstimation ? (
                                    <div className="flex justify-end">
                                        <Spinner theme="dark" className="!h-4 !w-4" />
                                    </div>
                                ) : (
                                    <span>
                                        <span className="text-xs">{stakingTokenInfo.symbol}</span>{' '}
                                        {toReadableNumber(
                                            dataMergingEstimation?.stakeAmount,
                                            stakingTokenInfo.decimals
                                        )}
                                    </span>
                                )}
                            </StatsBoxTwoColumn.RightColumn>

                            {dataMergingEstimation && dataMergingEstimation.feeAmount > 0 && (
                                <>
                                    <StatsBoxTwoColumn.LeftColumn>Merging Fee</StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        <span>
                                            <span className="text-xs">{stakingTokenInfo.symbol}</span>{' '}
                                            {toReadableNumber(
                                                dataMergingEstimation?.feeAmount,
                                                stakingTokenInfo.decimals
                                            )}
                                        </span>
                                    </StatsBoxTwoColumn.RightColumn>
                                </>
                            )}

                            {claimRewards && (
                                <>
                                    <StatsBoxTwoColumn.LeftColumn>Claim Estimate</StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {isLoadingMergingEstimation ? (
                                            <div className="flex justify-end">
                                                <Spinner theme="dark" className="!h-4 !w-4" />
                                            </div>
                                        ) : (
                                            <span>
                                                <span className="text-xs">{payoutToken.symbol}</span>{' '}
                                                {toReadableNumber(
                                                    dataMergingEstimation?.targetAmount,
                                                    payoutToken.decimals
                                                )}
                                            </span>
                                        )}
                                    </StatsBoxTwoColumn.RightColumn>
                                </>
                            )}

                            {stake && !stake.burned && stake.lock && (
                                <>
                                    <div className="col-span-2">
                                        <CaretDivider color="cyan" />
                                    </div>
                                    <StatsBoxTwoColumn.LeftColumn>Est. Unlock Date</StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {isLoadingBlock ? (
                                            <Spinner theme="dark" />
                                        ) : (
                                            <span>
                                                {new Date(
                                                    (Number(dataBlock?.timestamp) + Number(stake.lock)) * 1000
                                                ).toLocaleDateString(navigator.language, {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                })}
                                                ,{' '}
                                                {new Date(
                                                    (Number(dataBlock?.timestamp) + Number(stake.lock)) * 1000
                                                ).toLocaleTimeString(navigator.language)}
                                            </span>
                                        )}
                                    </StatsBoxTwoColumn.RightColumn>
                                </>
                            )}
                        </StatsBoxTwoColumn.Wrapper>
                    </div>
                    <Field className="mt-3 flex flex-row gap-2 px-2 pt-2 text-base">
                        <Checkbox
                            checked={isCheckboxSelected}
                            onChange={setIsCheckboxSelected}
                            className="size-[20px] group mt-1 block shrink-0 rounded-sm border border-dapp-cyan-50 bg-transparent data-[checked]:border-dapp-cyan-500  data-[checked]:bg-dapp-cyan-500"
                        >
                            <svg
                                className="stroke-white opacity-0 group-data-[checked]:opacity-100"
                                viewBox="0 0 14 14"
                                fill="none"
                            >
                                <path
                                    d="M3 8L6 11L11 3.5"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Checkbox>
                        <Label>
                            {stake.burned || !stake.locked ? (
                                <span>
                                    I understand that my burned {stakingTokenInfo.symbol} will be aggregated to a single
                                    stake
                                </span>
                            ) : (
                                <span>
                                    I understand that my {stakingTokenInfo.symbol} will be locked for{' '}
                                    {durationFromSeconds(Number(stake.lock), {
                                        long: true,
                                    })}{' '}
                                    and can not be withdrawn during this period
                                </span>
                            )}
                        </Label>
                    </Field>
                    <Button
                        disabled={!mergePossible}
                        variant="primary"
                        onClick={onClickHandler}
                        className="mt-6 flex w-full items-center justify-center gap-2"
                    >
                        {isLoadingMerge ? (
                            <>
                                <Spinner theme="dark" className="!h-4 !w-4" /> <span>processing...</span>
                            </>
                        ) : (
                            <span>Merge</span>
                        )}
                    </Button>
                </>
            )}

            {isLoadingMerge && dataMergingEstimation && (
                <div className="flex flex-col items-center gap-6 p-6 text-base">
                    <SpinnerCircular size={100} thickness={200} speed={50} color="#0F978E" secondaryColor="#DBEAE8" />
                    {!hashUpstake ? (
                        <div className="flex flex-col gap-4 text-center">
                            <div>
                                Your wallet is prompting you <br />
                                to confirm a merge of
                                <br />
                                <span className="text-xl font-bold">
                                    {toReadableNumber(dataMergingEstimation.stakeAmount, stakingTokenInfo.decimals)}{' '}
                                    {stakingTokenInfo.symbol}
                                </span>
                                <br />
                            </div>

                            {dataMergingEstimation.feeAmount > 0n && (
                                <div>
                                    With this you&apos;ll be charged with a merge fee of <br />
                                    <span className="text-xl font-bold">
                                        {toReadableNumber(dataMergingEstimation?.feeAmount, stakingTokenInfo.decimals)}{' '}
                                        {stakingTokenInfo.symbol}
                                    </span>
                                </div>
                            )}

                            {dataMergingEstimation.targetAmount > 0n && (
                                <div>
                                    You&apos;re about to claim an estimated amount of <br />
                                    <span className="text-xl font-bold">
                                        {toReadableNumber(dataMergingEstimation?.targetAmount, payoutToken.decimals)}{' '}
                                        {payoutToken.symbol}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">Waiting for transaction to be processed...</div>
                    )}
                </div>
            )}

            {isError && tokens && !isSuccessMerge && !isLoadingMerge && (
                <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                    <MdError className="size-[100px] text-error " />
                    There was an error: <br />
                    {error && (error as any).cause.shortMessage}
                    <br />
                    <br />
                    You can either retry the request <br />
                    or cancel the process.
                </div>
            )}

            {tokens && !isSuccessMerge && isError && (
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

            {!isLoadingMerge && isSuccessMerge && (
                <div className="flex flex-col">
                    <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                        <IoCheckmarkCircle className="size-[100px] text-success" />
                        <div>
                            Successfully merged <br />
                            <span className="text-xl font-bold">
                                {toReadableNumber(mergeAmount, stakingTokenInfo?.decimals)} {stakingTokenInfo?.symbol}
                            </span>
                        </div>
                        {typeof feeAmount === 'bigint' && feeAmount > 0n && (
                            <div>
                                A fee of {toReadableNumber(feeAmount, stakingTokenInfo?.decimals)}{' '}
                                {stakingTokenInfo?.symbol} has been charged from your merge amount
                            </div>
                        )}
                        {claimRewards && typeof claimedAmount === 'bigint' && claimedAmount > 0n && (
                            <div>
                                You received your reward of {toReadableNumber(claimedAmount, payoutToken?.decimals)}{' '}
                                {payoutToken?.symbol},
                            </div>
                        )}
                    </div>
                    <Button
                        variant="primary"
                        onClick={onClickCloseButtonHandler}
                        className="mt-2 flex w-full items-center justify-center gap-2"
                    >
                        Close
                    </Button>
                </div>
            )}
        </BaseOverlay>
    )
}
