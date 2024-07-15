import { toReadableNumber } from '@dapphelpers/number'
import { useGetClaimEstimation } from '@dapphooks/staking/useGetClaimEstimation'
import { useGetStakeBuckets } from '@dapphooks/staking/useGetStakeBuckets'
import { useRestake } from '@dapphooks/staking/useRestake'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { BaseOverlay, BaseOverlayProps } from '@dappshared/overlays/BaseOverlay'
import { StakeBucket, TokenInfo, TokenInfoResponse } from '@dapptypes'
import { useEffect, useState } from 'react'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { FaArrowLeft } from 'react-icons/fa'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { MdError } from 'react-icons/md'
import { SpinnerCircular } from 'spinners-react'
import { Button } from 'src/components/Button'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { Spinner } from '../../elements/Spinner'
import {
    StakeBucketButton,
    StakingDurationSelection,
} from '../StakingDurationSelection'

type StakingRestakeOverlayProps = {
    protocolAddress: Address
    stakingTokenInfo: TokenInfoResponse
    payoutTokenInfo: TokenInfo
    tokenId: bigint
} & BaseOverlayProps

export const StakingRestakeOverlay = ({
    protocolAddress,
    payoutTokenInfo,
    stakingTokenInfo,
    tokenId,
    isOpen,
    onClose,
}: StakingRestakeOverlayProps) => {
    const { address } = useAccount()
    const [isLoading, setIsLoading] = useState(true)
    const [isCheckboxSelected, setIsCheckboxSelected] = useState(false)
    const [stakeBucketId, setStakeBucketId] = useState<Address>()
    const [selectedStake, setSelectedStake] = useState<StakeBucket>()
    const [durationButtons, setDurationButtons] =
        useState<StakeBucketButton[]>()

    //
    // Data Hooks
    //
    const { data: stakeBucketsData, isLoading: isLoadingGetStakeBuckets } =
        useGetStakeBuckets(protocolAddress)
    const { data: claimEstimationNFT, isLoading: isLoadingClaimEstimationNFT } =
        useGetClaimEstimation(
            true,
            protocolAddress,
            payoutTokenInfo.source,
            address!,
            tokenId
        )
    const {
        data: claimEstimationStakingToken,
        isLoading: isLoadingClaimEstimationStakingToken,
    } = useGetClaimEstimation(
        true,
        protocolAddress,
        stakingTokenInfo.source,
        address!,
        tokenId
    )
    const {
        write,
        isLoading: isLoadingRestake,
        isSuccess: isSuccessRestake,
        isError: isError,
        error,
        reset,
        restakeAmount,
        feeAmount,
        hash: hashRestake,
    } = useRestake(
        Boolean(isCheckboxSelected && stakeBucketId),
        protocolAddress,
        tokenId,
        stakeBucketId!
    )

    //
    // Handlers
    //
    const onClickHandler = () => {
        write()
    }

    const onCloseHandler = () => {
        reset()
        onClose()
    }

    const onCheckboxHandler = (checked: boolean) =>
        setIsCheckboxSelected(checked)

    const onDurationSelectionHandler = (duration: StakeBucketButton) =>
        setStakeBucketId(duration?.id)

    const onClickTryAgainButtonHandler = () => {
        reset()
        setStakeBucketId(undefined)
        setSelectedStake(undefined)
        setIsCheckboxSelected(false)
    }

    const onClickCancelButtonHandler = () => {
        onCloseHandler()
    }

    const onClickCloseButtonHandler = () => {
        onCloseHandler()
    }

    //
    // Effects
    //

    useEffect(() => {
        setIsLoading(
            isLoadingGetStakeBuckets ||
                isLoadingClaimEstimationNFT ||
                isLoadingClaimEstimationStakingToken
        )
    }, [
        isLoadingGetStakeBuckets,
        isLoadingClaimEstimationNFT,
        isLoadingClaimEstimationStakingToken,
    ])

    useEffect(() => {
        if (stakeBucketsData) {
            setDurationButtons(
                stakeBucketsData.map(
                    ({ id, duration, burn, multiplier }) =>
                        ({
                            id,
                            multiplier,
                            duration,
                            burn,
                            selected: id === stakeBucketId,
                        } as StakeBucketButton)
                )
            )

            if (stakeBucketId) {
                setSelectedStake(
                    stakeBucketsData.find(({ id }) => id === stakeBucketId)
                )
            } else setSelectedStake(undefined)
        }
    }, [stakeBucketsData, stakeBucketId])

    return (
        <BaseOverlay
            isOpen={isOpen}
            closeOnBackdropClick={false}
            onClose={onCloseHandler}
        >
            {isLoading && (
                <div className="item-center flex flex-row justify-center">
                    <Spinner theme="dark" className="m-20 !h-24 !w-24" />
                </div>
            )}

            {!isLoading && !isLoadingRestake && !isSuccessRestake && !isError && (
                <>
                    <div className="flex flex-col gap-6 text-base">
                        <h3 className="flex flex-row items-center gap-3 text-xl">
                            <div className="font-title">Re-Stake</div>
                            <div>
                                <AiOutlineQuestionCircle />
                            </div>
                            <div className="flex flex-grow justify-end">
                                <button
                                    type="button"
                                    className="flex items-center justify-end gap-1 text-xs"
                                    onClick={onCloseHandler}
                                >
                                    <FaArrowLeft className="h-3 w-3" />
                                    Back
                                </button>
                            </div>
                        </h3>

                        {durationButtons && (
                            <StakingDurationSelection
                                description="Choose how to Re-Stake your Rewards."
                                tokenSymbol={stakingTokenInfo.symbol}
                                durations={durationButtons}
                                onCheckbox={onCheckboxHandler}
                                onDurationSelection={onDurationSelectionHandler}
                                isCheckboxSelected={isCheckboxSelected}
                            />
                        )}

                        <StatsBoxTwoColumn.Wrapper className="rounded-lg bg-dapp-blue-800 px-5 py-2 text-sm">
                            <StatsBoxTwoColumn.LeftColumn>
                                <span className="text-sm text-darkTextLowEmphasis">
                                    NFT#{tokenId.toString()} Rewards
                                </span>
                            </StatsBoxTwoColumn.LeftColumn>
                            <StatsBoxTwoColumn.RightColumn>
                                <span className="text-darkTextLowEmphasis">
                                    {payoutTokenInfo.symbol}{' '}
                                    {toReadableNumber(
                                        claimEstimationNFT,
                                        payoutTokenInfo.decimals
                                    )}
                                </span>
                            </StatsBoxTwoColumn.RightColumn>

                            <div className="col-span-2">
                                <CaretDivider color="cyan" />
                            </div>

                            <StatsBoxTwoColumn.LeftColumn>
                                Approx. {stakingTokenInfo.symbol}{' '}
                            </StatsBoxTwoColumn.LeftColumn>
                            <StatsBoxTwoColumn.RightColumn>
                                {`~ ${toReadableNumber(
                                    claimEstimationStakingToken,
                                    stakingTokenInfo.decimals
                                )}`}
                            </StatsBoxTwoColumn.RightColumn>

                            <StatsBoxTwoColumn.LeftColumn>
                                Est. Unlock Date
                            </StatsBoxTwoColumn.LeftColumn>
                            <StatsBoxTwoColumn.RightColumn>
                                {selectedStake ? (
                                    !selectedStake.burn ? (
                                        `${new Date(
                                            Date.now() +
                                                selectedStake.duration * 1000
                                        ).toLocaleDateString(
                                            navigator.language,
                                            {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                            }
                                        )}, ${new Date(
                                            Date.now() +
                                                selectedStake.duration * 1000
                                        ).toLocaleTimeString(
                                            navigator.language
                                        )}`
                                    ) : (
                                        <span className="font-bold text-degenOrange">
                                            BURNED
                                        </span>
                                    )
                                ) : (
                                    '-'
                                )}
                            </StatsBoxTwoColumn.RightColumn>
                        </StatsBoxTwoColumn.Wrapper>
                    </div>
                    <Button
                        disabled={!isCheckboxSelected || !stakeBucketId}
                        variant="primary"
                        onClick={onClickHandler}
                        className="mt-6 flex w-full items-center justify-center gap-2"
                    >
                        {isLoadingRestake ? (
                            <>
                                <Spinner theme="dark" className="!h-4 !w-4" />{' '}
                                <span>processing...</span>
                            </>
                        ) : (
                            <span>Re-Stake Rewards</span>
                        )}
                    </Button>
                </>
            )}

            {isLoadingRestake && (
                <div className="flex flex-col items-center gap-6 p-6 text-base">
                    <SpinnerCircular
                        size={100}
                        thickness={200}
                        speed={50}
                        color="#0F978E"
                        secondaryColor="#DBEAE8"
                    />
                    {!hashRestake ? (
                        <div className="text-center">
                            Your wallet is prompting you <br />
                            to confirm a re-stake of
                            <br />
                            <span className="text-xl font-bold">
                                ~{' '}
                                {toReadableNumber(
                                    claimEstimationStakingToken,
                                    stakingTokenInfo.decimals
                                )}{' '}
                                {stakingTokenInfo.symbol}
                            </span>
                            <br />
                        </div>
                    ) : (
                        <div className="text-center">
                            Waiting for transaction to be processed...
                        </div>
                    )}
                </div>
            )}

            {isError && !isLoading && !isSuccessRestake && !isLoadingRestake && (
                <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                    <MdError className="h-[100px] w-[100px] text-error " />
                    There was an error: <br />
                    {error && (error as any).details}
                </div>
            )}

            {!isLoading && !isSuccessRestake && isError && (
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

            {!isLoadingRestake && isSuccessRestake && (
                <>
                    <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                        <IoCheckmarkCircle className="h-[100px] w-[100px] text-success" />
                        <span>
                            Successfully re-staked <br />
                            <span className="text-xl font-bold">
                                {toReadableNumber(
                                    restakeAmount,
                                    stakingTokenInfo?.decimals
                                )}{' '}
                                {stakingTokenInfo?.symbol}
                            </span>
                            {typeof feeAmount === 'bigint' && feeAmount > 0n && (
                                <>
                                    <br />
                                    <br />A fee of{' '}
                                    {toReadableNumber(
                                        feeAmount,
                                        stakingTokenInfo?.decimals
                                    )}{' '}
                                    {stakingTokenInfo?.symbol} has been charged
                                    from your re-staking amount
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
        </BaseOverlay>
    )
}
