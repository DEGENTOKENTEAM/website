import { toReadableNumber } from '@dapphelpers/number'
import { useGetRewardEstimationForTokens } from '@dapphooks/staking/useGetRewardEstimationForTokens'
import { useGetStakes } from '@dapphooks/staking/useGetStakes'
import { useGetTargetTokens } from '@dapphooks/staking/useGetTargetTokens'
import { useWithdraw } from '@dapphooks/staking/useWithdraw'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { BaseOverlay, BaseOverlayProps } from '@dappshared/overlays/BaseOverlay'
import { StakeResponse, TokenInfo, TokenInfoResponse } from '@dapptypes'
import { pick } from 'lodash'
import { useEffect, useState } from 'react'
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

type StakingWithdrawOverlayProps = {
    protocolAddress: Address
    stakingTokenInfo: TokenInfoResponse
    payoutTokenInfo: TokenInfo
    tokenId: bigint
} & BaseOverlayProps

export const StakingWithdrawOverlay = ({
    tokenId,
    isOpen,
    onClose,
    protocolAddress,
    stakingTokenInfo,
    payoutTokenInfo,
}: StakingWithdrawOverlayProps) => {
    const { address } = useAccount()
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingRewards, setIsLoadingRewards] = useState(true)
    const [payoutToken, setPayoutToken] = useState<TokenInfo>(payoutTokenInfo)
    const [rewardAmount, setRewardAmount] = useState<bigint>(0n)
    const [withdrawAmount, setWithdrawAmount] = useState<bigint>(0n)
    const [rewardAmountEstimation, setRewardAmountEstimation] =
        useState<bigint>(0n)
    const [stake, setStake] = useState<StakeResponse>()
    const [targetTokens, setTargetTokens] = useState<TokenInfoResponse[]>([])

    const { data: dataStakes } = useGetStakes(true, protocolAddress, address!)
    const { data: dataTargetTokens } = useGetTargetTokens(
        protocolAddress,
        43114
    ) // TODO make chain id dynamic
    const { data: rewardEstimations, refetch: refetchRewardEstimations } =
        useGetRewardEstimationForTokens(
            protocolAddress,
            [tokenId],
            payoutToken?.source
        )
    const {
        write,
        reset,
        isLoading: isLoadingWithdraw,
        isSuccess: isSuccessWithdraw,
        claimedAmount,
        withdrawnAmount,
        feeAmount,
        isError,
        error,
        hash: hashWithdraw,
    } = useWithdraw(
        Boolean(payoutToken),
        protocolAddress,
        tokenId,
        payoutToken?.source
    )

    const onCloseHandler = () => {
        reset()
        onClose && onClose()
    }

    const onClickPayoutHandler = (target: TokenInfoResponse) => {
        if (payoutToken?.source != target.source) {
            setIsLoadingRewards(true)
            setRewardAmount(0n)
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
        write()
    }

    const onClickCancelButtonHandler = () => {
        onCloseHandler()
    }

    const onClickCloseButtonHandler = () => {
        onCloseHandler()
    }

    const onClickTryAgainButtonHandler = () => {
        reset()
    }

    useEffect(() => {
        if (
            rewardEstimations &&
            Boolean(rewardEstimations.length && rewardEstimations[0])
        ) {
            setRewardAmount(rewardEstimations[0]?.amount)
            setRewardAmountEstimation(rewardEstimations[0]?.amount)
            setIsLoadingRewards(false)
        } else {
            setRewardAmount(0n)
            setRewardAmountEstimation(0n)
        }
    }, [rewardEstimations])

    useEffect(() => {
        setIsLoadingRewards(
            !Boolean(rewardEstimations && rewardEstimations.length && stake)
        )
    }, [rewardEstimations, stake])

    useEffect(() => {
        if (dataStakes) {
            const _stake = dataStakes.find(
                (stake) =>
                    BigInt(tokenId.toString()) ==
                    BigInt(stake.tokenId.toString())
            )
            if (_stake) {
                // withdraw burns stake/nft
                setStake(_stake)
                setWithdrawAmount(_stake.amount)
            }
        }
    }, [tokenId, dataStakes])

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
        if (isLoading)
            setIsLoading(
                !Boolean(
                    dataTargetTokens &&
                        dataTargetTokens.length &&
                        dataStakes &&
                        dataStakes.length &&
                        rewardEstimations &&
                        rewardEstimations.length
                )
            )
    }, [isLoading, dataTargetTokens, dataStakes, rewardEstimations])

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
                !isLoadingWithdraw &&
                !isSuccessWithdraw &&
                !isError && (
                    <>
                        <div className="flex flex-col gap-6 text-base">
                            <h3 className="flex flex-row items-center gap-3 text-xl">
                                <div className="font-title">
                                    Withdraw & Claim
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
                                <StatsBoxTwoColumn.Wrapper className="rounded-lg bg-dapp-blue-800 px-5 py-2 text-sm">
                                    <StatsBoxTwoColumn.LeftColumn>
                                        <span className="text-darkTextLowEmphasis">
                                            NFT#{tokenId.toString()} Staked{' '}
                                            {stakingTokenInfo.symbol}
                                        </span>
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        <span className="text-darkTextLowEmphasis">
                                            {toReadableNumber(
                                                stake?.amount,
                                                stakingTokenInfo.decimals
                                            )}
                                        </span>
                                    </StatsBoxTwoColumn.RightColumn>
                                    <StatsBoxTwoColumn.LeftColumn>
                                        <span className="text-darkTextLowEmphasis">
                                            NFT#{tokenId.toString()} Rewards
                                        </span>
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {payoutToken?.symbol}{' '}
                                        {toReadableNumber(
                                            rewardAmount,
                                            payoutToken?.decimals
                                        )}
                                    </StatsBoxTwoColumn.RightColumn>

                                    <div className="col-span-2">
                                        <CaretDivider color="cyan" />
                                    </div>

                                    <StatsBoxTwoColumn.LeftColumn>
                                        Withdraw {stakingTokenInfo.symbol}{' '}
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {toReadableNumber(
                                            withdrawAmount,
                                            stakingTokenInfo.decimals
                                        )}
                                    </StatsBoxTwoColumn.RightColumn>

                                    <StatsBoxTwoColumn.LeftColumn>
                                        Approx. {payoutToken?.symbol}{' '}
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        ~{' '}
                                        {toReadableNumber(
                                            rewardAmountEstimation,
                                            payoutToken?.decimals
                                        )}
                                    </StatsBoxTwoColumn.RightColumn>
                                </StatsBoxTwoColumn.Wrapper>
                            )}
                        </div>
                    </>
                )}

            {isLoadingWithdraw && (
                <div className="flex flex-col items-center gap-6 p-6 text-base">
                    <SpinnerCircular
                        size={100}
                        thickness={200}
                        speed={50}
                        color="#0F978E"
                        secondaryColor="#DBEAE8"
                    />
                    {!hashWithdraw ? (
                        <div className="text-center">
                            Your wallet is prompting you <br />
                            to confirm a withdraw of <br />
                            <span className="text-xl font-bold">
                                {toReadableNumber(
                                    withdrawAmount,
                                    stakingTokenInfo.decimals
                                )}{' '}
                                {stakingTokenInfo.symbol}
                            </span>
                            <br /> and claim of <br />
                            <span className="text-xl font-bold">
                                {toReadableNumber(
                                    rewardAmount,
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

            {isError &&
                error &&
                !isLoading &&
                !isSuccessWithdraw &&
                !isLoadingWithdraw && (
                    <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                        <MdError className="h-[100px] w-[100px] text-error " />
                        There was an error: <br />
                        {error && (error as any).details}
                    </div>
                )}

            {!isLoadingWithdraw && isSuccessWithdraw && (
                <>
                    <div className="flex flex-col items-center gap-6 p-6 text-center text-base">
                        <IoCheckmarkCircle className="h-[100px] w-[100px] text-success" />
                        <span>
                            Successfully withdrawn <br />
                            <span className="text-xl font-bold">
                                {toReadableNumber(
                                    withdrawnAmount,
                                    stakingTokenInfo.decimals
                                )}{' '}
                                {stakingTokenInfo.symbol}
                            </span>
                            <br /> and claimed <br />
                            <span className="text-xl font-bold">
                                {toReadableNumber(
                                    claimedAmount,
                                    payoutToken?.decimals
                                )}{' '}
                                {payoutToken?.symbol}
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
                                    from your withdraw amount
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

            {!isLoading &&
                !isSuccessWithdraw &&
                !isLoadingWithdraw &&
                !isError && (
                    <Button
                        variant="primary"
                        onClick={onClickButtonHandler}
                        className="mt-6 flex w-full items-center justify-center gap-2"
                    >
                        Withdraw {stakingTokenInfo.symbol} & Claim
                    </Button>
                )}

            {!isLoading && !isSuccessWithdraw && isError && (
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
