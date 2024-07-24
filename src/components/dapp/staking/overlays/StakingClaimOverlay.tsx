import { toReadableNumber } from '@dapphelpers/number'
import { useClaim } from '@dapphooks/staking/useClaim'
import { useClaimAll } from '@dapphooks/staking/useClaimAll'
import { useGetClaimAllEstimation } from '@dapphooks/staking/useGetClaimAllEstimation'
import { useGetClaimEstimation } from '@dapphooks/staking/useGetClaimEstimation'
import { useGetRewardEstimationForTokens } from '@dapphooks/staking/useGetRewardEstimationForTokens'
import { useGetStakes } from '@dapphooks/staking/useGetStakes'
import { useGetTargetTokens } from '@dapphooks/staking/useGetTargetTokens'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { BaseOverlay, BaseOverlayProps } from '@dappshared/overlays/BaseOverlay'
import { TokenInfo, TokenInfoResponse } from '@dapptypes'
import { pick } from 'lodash'
import { Fragment, useEffect, useState } from 'react'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { FaArrowLeft } from 'react-icons/fa6'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { MdError } from 'react-icons/md'
import { SpinnerCircular } from 'spinners-react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { Button } from '../../../Button'
import { Spinner } from '../../elements/Spinner'
import { StakingPayoutTokenSelection } from '../StakingPayoutTokenSelection'

type StakingClaimOverlayAllProps = { tokenId?: never; isClaimAll: true }
type StakingClaimOverlaySingleProps = { tokenId: bigint; isClaimAll?: false }
type StakingClaimOverlayProps = {
    protocolAddress: Address
    targetToken: TokenInfo
} & (StakingClaimOverlayAllProps | StakingClaimOverlaySingleProps) &
    BaseOverlayProps

export const StakingClaimOverlay = ({
    tokenId,
    isOpen,
    onClose,
    targetToken,
    protocolAddress,
    isClaimAll = false,
}: StakingClaimOverlayProps) => {
    const { address } = useAccount()
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingRewards, setIsLoadingRewards] = useState(true)
    const [payoutToken, setPayoutToken] = useState<TokenInfo>(targetToken)
    const [rewards, setRewards] = useState<any[]>()
    const [rewardTotalAmount, setRewardTotalAmount] = useState<bigint>(0n)
    const [rewardTotalAmountEstimation, setRewardTotalAmountEstimation] =
        useState<bigint>(0n)
    const [tokenIds, setTokenIds] = useState<bigint[]>()
    const [targetTokens, setTargetTokens] = useState<TokenInfoResponse[]>([])
    const [claimedAmount, setClaimedAmount] = useState<bigint>(0n)

    const {
        write: writeClaimAll,
        isLoading: isLoadingClaimAll,
        isSuccess: isSuccessClaimAll,
        isError: isErrorClaimAll,
        error: errorClaimAll,
        reset: resetClaimAll,
        rewardAmount: rewardAmountClaimAll,
        hash: hashClaimAll,
    } = useClaimAll(
        Boolean(payoutToken && isClaimAll),
        protocolAddress,
        payoutToken?.source
    )

    const {
        write: writeClaim,
        isLoading: isLoadingClaim,
        isSuccess: isSuccessClaim,
        isError: isErrorClaim,
        error: errorClaim,
        reset: resetClaim,
        rewardAmount: rewardAmountClaim,
        hash: hashClaim,
    } = useClaim(
        Boolean(payoutToken && tokenId && !isClaimAll),
        protocolAddress,
        tokenId!,
        payoutToken?.source
    )

    const { data: dataTargetTokens } = useGetTargetTokens(
        protocolAddress,
        43114
    ) // TODO make chain id dynamic
    const { data: rewardEstimations, refetch: refetchRewardEstimations } =
        useGetRewardEstimationForTokens(
            protocolAddress,
            tokenIds!,
            payoutToken?.source
        )
    const { data: dataStakes } = useGetStakes(
        isClaimAll,
        protocolAddress,
        address!
    )
    const { data: claimAllEstimation, isLoading: isLoadingClaimAllEstimation } =
        useGetClaimAllEstimation(
            Boolean(isClaimAll && address && payoutToken),
            protocolAddress,
            payoutToken?.source,
            address!
        )

    const { data: claimEstimation, isLoading: isLoadingClaimEstimation } =
        useGetClaimEstimation(
            Boolean(!isClaimAll && address && tokenId && payoutToken),
            protocolAddress,
            payoutToken?.source,
            address!,
            tokenId!
        )

    const onCloseHandler = () => {
        onClose && onClose()

        if (isClaimAll) resetClaimAll()
        else resetClaim()
    }

    const onClickPayoutHandler = (target: TokenInfoResponse) => {
        if (payoutToken?.source != target.source) {
            setIsLoadingRewards(true)
            setRewards([])
            setPayoutToken(
                pick(target, [
                    'name',
                    'symbol',
                    'decimals',
                    'source',
                ]) as TokenInfo
            )
        }
    }

    const onClickButtonHandler = () => {
        isClaimAll && writeClaimAll()
        !isClaimAll && writeClaim()
    }

    const onClickCancelButtonHandler = () => {
        onCloseHandler()
    }

    const onClickCloseButtonHandler = () => {
        onCloseHandler()
    }

    const onClickTryAgainButtonHandler = () => {
        isClaimAll && resetClaimAll()
        !isClaimAll && resetClaim()
    }

    useEffect(() => {
        if (
            tokenIds &&
            rewardEstimations &&
            Boolean(tokenIds.length && rewardEstimations.length)
        ) {
            setRewards(
                tokenIds
                    .map((tokenId, i) => ({
                        tokenId: '' + tokenId,
                        amount: rewardEstimations[i].amount,
                    }))
                    .filter(({ amount }) => amount > 0n)
            )

            isClaimAll &&
                setRewardTotalAmount(
                    rewardEstimations.reduce(
                        (acc, rewardEstimation) =>
                            acc + BigInt(rewardEstimation.amount),
                        0n
                    )
                )
        } else {
            setRewards([])
            setRewardTotalAmount(0n)
            setRewardTotalAmountEstimation(0n)
        }
    }, [isClaimAll, tokenIds, rewardEstimations])

    useEffect(() => {
        if (dataStakes) setTokenIds(dataStakes.map((stake) => stake.tokenId))
    }, [dataStakes])

    useEffect(() => {
        if (tokenId) setTokenIds([tokenId])
    }, [tokenId])

    useEffect(() => {
        if (tokenId && payoutToken && refetchRewardEstimations)
            refetchRewardEstimations()
    }, [tokenId, payoutToken, refetchRewardEstimations])

    useEffect(() => {
        if (dataTargetTokens && dataTargetTokens.length > 0) {
            setTargetTokens(
                dataTargetTokens.filter((token) => token.isTargetActive)
            )
        } else setTargetTokens([])
    }, [dataTargetTokens])

    useEffect(() => {
        setRewardTotalAmountEstimation(
            (isClaimAll ? claimAllEstimation : claimEstimation) as bigint
        )
    }, [claimAllEstimation, claimEstimation, isClaimAll])

    useEffect(() => {
        // initial loading
        const estimation = isClaimAll ? claimAllEstimation : claimEstimation

        if (isLoading)
            setIsLoading(
                !Boolean(
                    dataTargetTokens &&
                        dataTargetTokens.length &&
                        estimation &&
                        dataStakes &&
                        dataStakes.length &&
                        tokenIds &&
                        tokenIds.length &&
                        rewardEstimations &&
                        rewardEstimations.length
                )
            )
    }, [
        isClaimAll,
        isLoading,
        dataTargetTokens,
        claimAllEstimation,
        claimEstimation,
        dataStakes,
        tokenIds,
        rewardEstimations,
    ])

    useEffect(() => {
        const hasRewards = rewards && rewards.length

        const isLoadingEstimation = isClaimAll
            ? isLoadingClaimAllEstimation
            : isLoadingClaimEstimation

        const rewardTotal = isClaimAll
            ? rewardTotalAmountEstimation > 0n && rewardTotalAmount > 0n
            : rewardTotalAmountEstimation > 0n

        if (isLoadingRewards)
            setIsLoadingRewards(
                !(!isLoadingEstimation && hasRewards && rewardTotal)
            )
    }, [
        rewards,
        rewardTotalAmount,
        rewardTotalAmountEstimation,
        isLoadingClaimEstimation,
        isLoadingClaimAllEstimation,
        isClaimAll,
        isLoading,
        isLoadingRewards,
    ])

    useEffect(() => {
        if (!isClaimAll && isSuccessClaim && rewardAmountClaim)
            setClaimedAmount(rewardAmountClaim)

        if (isClaimAll && isSuccessClaimAll && rewardAmountClaimAll)
            setClaimedAmount(rewardAmountClaimAll)
    }, [
        isSuccessClaimAll,
        rewardAmountClaimAll,
        rewardAmountClaim,
        isClaimAll,
        isSuccessClaim,
    ])

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

            {!isLoading &&
                !isSuccessClaim &&
                !isSuccessClaimAll &&
                !isLoadingClaim &&
                !isLoadingClaimAll &&
                !isErrorClaim &&
                !isErrorClaimAll && (
                    <>
                        <div className="flex flex-col gap-6 text-base">
                            <h3 className="flex flex-row items-center gap-3 text-xl">
                                <div className="font-title">
                                    {isClaimAll ? 'Claim All' : 'Claim'}
                                </div>
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

                            <StakingPayoutTokenSelection
                                selectedToken={payoutToken}
                                tokens={targetTokens}
                                onSelect={onClickPayoutHandler}
                            />

                            {isLoadingRewards && (
                                <div className="flex justify-center rounded-lg bg-dapp-blue-800 p-5">
                                    <Spinner
                                        theme="dark"
                                        className="!h-10 !w-10"
                                    />
                                </div>
                            )}

                            {!isLoadingRewards && (
                                <StatsBoxTwoColumn.Wrapper className="max-h-64 overflow-y-scroll rounded-lg bg-dapp-blue-800 px-5 py-2 text-sm">
                                    {rewards &&
                                        rewards.length > 0 &&
                                        rewards.map((reward) => (
                                            <Fragment key={reward.tokenId}>
                                                <StatsBoxTwoColumn.LeftColumn>
                                                    <span className="text-xs text-darkTextLowEmphasis">
                                                        NFT#{reward.tokenId}{' '}
                                                        Rewards
                                                    </span>
                                                </StatsBoxTwoColumn.LeftColumn>
                                                <StatsBoxTwoColumn.RightColumn>
                                                    <span className="text-darkTextLowEmphasis">
                                                        {payoutToken?.symbol}{' '}
                                                        {toReadableNumber(
                                                            reward.amount,
                                                            payoutToken?.decimals
                                                        )}
                                                    </span>
                                                </StatsBoxTwoColumn.RightColumn>
                                            </Fragment>
                                        ))}

                                    {isClaimAll && (
                                        <>
                                            <div className="col-span-2">
                                                <CaretDivider />
                                            </div>

                                            <StatsBoxTwoColumn.LeftColumn>
                                                Total Rewards
                                            </StatsBoxTwoColumn.LeftColumn>
                                            <StatsBoxTwoColumn.RightColumn>
                                                {payoutToken?.symbol}{' '}
                                                {toReadableNumber(
                                                    rewardTotalAmount,
                                                    payoutToken?.decimals
                                                )}
                                            </StatsBoxTwoColumn.RightColumn>
                                        </>
                                    )}

                                    <div className="col-span-2">
                                        <CaretDivider color="cyan" />
                                    </div>

                                    <StatsBoxTwoColumn.LeftColumn>
                                        Approx. {payoutToken?.symbol}{' '}
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {`~ ${toReadableNumber(
                                            rewardTotalAmountEstimation,
                                            payoutToken?.decimals
                                        )}`}
                                    </StatsBoxTwoColumn.RightColumn>
                                </StatsBoxTwoColumn.Wrapper>
                            )}
                        </div>
                    </>
                )}

            {(isLoadingClaim || isLoadingClaimAll) && (
                <div className="flex flex-col items-center gap-6 p-6 text-base">
                    <SpinnerCircular
                        size={100}
                        thickness={200}
                        speed={50}
                        color="#0F978E"
                        secondaryColor="#DBEAE8"
                    />
                    {!hashClaim && !hashClaimAll ? (
                        <div className="text-center">
                            Your wallet is prompting you to confirm a claim of
                            <br />
                            <span className="text-xl font-bold">
                                ~{' '}
                                {toReadableNumber(
                                    rewardTotalAmountEstimation,
                                    payoutToken?.decimals
                                )}{' '}
                                {payoutToken?.symbol}
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

            {(isErrorClaimAll || isErrorClaim) &&
                !isLoading &&
                !isSuccessClaim &&
                !isSuccessClaimAll &&
                !isLoadingClaim &&
                !isLoadingClaimAll && (
                    <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                        <MdError className="h-[100px] w-[100px] text-error " />
                        There was an error: <br />
                        {errorClaimAll && (errorClaimAll as any).details}
                        {errorClaim && (errorClaim as any).details}
                    </div>
                )}

            {((!isLoadingClaim && isSuccessClaim) ||
                (!isLoadingClaimAll && isSuccessClaimAll)) && (
                <>
                    <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                        <IoCheckmarkCircle className="h-[100px] w-[100px] text-success" />
                        <span className="font-bold">
                            Successfully claimed <br />
                            <span className="text-xl font-bold">
                                {toReadableNumber(
                                    claimedAmount,
                                    payoutToken?.decimals
                                )}{' '}
                                {payoutToken?.symbol}
                            </span>
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

            {!isLoading &&
                !isSuccessClaim &&
                !isSuccessClaimAll &&
                !isLoadingClaim &&
                !isLoadingClaimAll &&
                !isErrorClaim &&
                !isErrorClaimAll && (
                    <Button
                        variant="primary"
                        onClick={onClickButtonHandler}
                        className="mt-6 flex w-full items-center justify-center gap-2"
                    >
                        Claim Rewards
                    </Button>
                )}

            {!isLoading &&
                !isSuccessClaim &&
                !isSuccessClaimAll &&
                (isErrorClaimAll || isErrorClaim) && (
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
        </BaseOverlay>
    )
}
