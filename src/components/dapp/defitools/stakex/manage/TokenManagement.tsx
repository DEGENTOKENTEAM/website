import { ManageStakeXContext } from '@dapphelpers/defitools'
import { toReadableNumber } from '@dapphelpers/number'
import { useGetChainExplorer } from '@dapphooks/shared/useGetChainExplorer'
import { RoutingsForTokenResponse } from '@dapphooks/staking/useGetRoutingsForToken'
import { useGetTargetTokens } from '@dapphooks/staking/useGetTargetTokens'
import { useSetTokens } from '@dapphooks/staking/useSetTokens'
import { useTogglePayoutTokenStatus } from '@dapphooks/staking/useTogglePayoutTokenStatus'
import { useToggleRewardTokenStatus } from '@dapphooks/staking/useToggleRewardTokenStatus'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { Tile } from '@dappshared/Tile'
import { SetTargetTokenParams } from '@dapptypes'
import { useCallback, useContext, useEffect, useState } from 'react'
import { FaPlus, FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa'
import { IoMdOpen } from 'react-icons/io'
import { toast } from 'react-toastify'
import { Button } from 'src/components/Button'
import { Spinner } from 'src/components/dapp/elements/Spinner'
import { Address } from 'viem'
import { TokensForm } from './tokens/Form'
import { ApplyChangesConfirmation } from './tokens/overlays/ApplyChangesConfirmation'

export const TokenManagement = () => {
    const {
        data: { protocol, chain, isOwner, owner },
    } = useContext(ManageStakeXContext)

    const [error, setError] = useState<string | null>(null)
    const [isReward, setIsReward] = useState<boolean | null>(null)

    const [showForm, setShowForm] = useState(false)
    const [payoutTokenData, setPayoutTokenData] =
        useState<SetTargetTokenParams | null>(null)
    const [isApplyChangesModalOpen, setIsApplyChangesModalOpen] =
        useState(false)

    const {
        data: dataTargetTokens,
        isLoading: isLoadingTargetTokens,
        refetch: refetchTargetTokens,
    } = useGetTargetTokens(protocol, chain?.id!)

    const {
        isLoading: isLoadingSetTokens,
        isPending: isPendingSetTokens,
        isError: isErrorSetTokens,
        error: errorSetTokens,
        isSuccess: isSuccessSetTokens,
        reset: resetSetTokens,
        write: writeSetTokens,
    } = useSetTokens(
        Boolean(payoutTokenData && chain && owner && isReward !== null),
        chain?.id!,
        protocol,
        owner,
        payoutTokenData!,
        Boolean(isReward)
    )

    const {
        write: togglePayoutToken,
        token: togglePayoutTokenAddress,
        error: errorTogglePayoutToken,
        isError: isErrorTogglePayoutToken,
        isSuccess: isSuccessTogglePayoutToken,
        reset: resetTogglePayoutToken,
    } = useTogglePayoutTokenStatus(chain?.id!, protocol, owner)
    const {
        write: toggleRewardToken,
        token: toggleRewardTokenAddress,
        error: errorToggleRewardToken,
        isError: isErrorToggleRewardToken,
        isSuccess: isSuccessToggleRewardToken,
        reset: resetToggleRewardToken,
    } = useToggleRewardTokenStatus(chain?.id!, protocol, owner)

    const chainExplorer = useGetChainExplorer(chain!)

    const resetError = () => setError(null)

    const onChangeForm = (
        routings: RoutingsForTokenResponse,
        isReward: boolean
    ) => {
        resetError()
        if (!routings) {
            setPayoutTokenData(null)
            return
        }

        if (isReward !== null) setIsReward(isReward)

        setPayoutTokenData({
            targetToken: routings[0].fromToken.address,
            candidatesGroup: routings.map((route) => ({
                rewardToken: route.toToken.address,
                candidates: route.paths.toReversed().map((path) => ({
                    calleeSwap: path.dex.router,
                    calleeAmountOut: path.dex.reader ?? path.dex.router,
                    path: [path.toToken.address, path.fromToken.address],
                    isGmx: Boolean(path.dex.reader),
                })),
            })),
        })
    }

    const onClickAddButton = () => {
        resetSetTokens()
        setShowForm(true)
    }

    const onClickCancelButton = () => {
        resetSetTokens()
        setPayoutTokenData(null)
        setShowForm(false)
    }

    const onClickSaveButton = () => {
        resetSetTokens()
        setIsApplyChangesModalOpen(true)
    }

    const onConfirmationModalOK = useCallback(() => {
        payoutTokenData &&
            writeSetTokens &&
            isReward !== null &&
            writeSetTokens()
    }, [writeSetTokens, payoutTokenData, isReward])

    const onConfirmationModalNOK = () => {
        setIsApplyChangesModalOpen(false)
    }

    const onConfirmationModalClose = () => {
        refetchTargetTokens && refetchTargetTokens()
        setShowForm(false)
        setPayoutTokenData(null)
        setIsApplyChangesModalOpen(false)
    }

    const onClickTogglePayoutToken = (token: Address, status: boolean) => {
        togglePayoutToken(token, status)
    }

    const onClickToggleRewardToken = (token: Address, status: boolean) => {
        toggleRewardToken(token, status)
    }

    useEffect(() => {
        if (isSuccessTogglePayoutToken && !isErrorTogglePayoutToken) {
            toast.success(`Successfully changed the payout token status`)
            refetchTargetTokens()
            resetTogglePayoutToken()
        }
        if (isErrorTogglePayoutToken && errorTogglePayoutToken) {
            toast.error((errorTogglePayoutToken as any).shortMessage)
            resetTogglePayoutToken()
        }
    }, [
        isSuccessTogglePayoutToken,
        isErrorTogglePayoutToken,
        errorTogglePayoutToken,
    ])

    useEffect(() => {
        if (isSuccessToggleRewardToken && !isErrorToggleRewardToken) {
            toast.success(`Successfully changed the payout token status`)
            refetchTargetTokens()
            resetToggleRewardToken()
        }
        if (isErrorToggleRewardToken && errorToggleRewardToken) {
            toast.error((errorToggleRewardToken as any).shortMessage)
            resetToggleRewardToken()
        }
    }, [
        isSuccessToggleRewardToken,
        isErrorToggleRewardToken,
        errorToggleRewardToken,
    ])

    return (
        <>
            <Tile className="w-full">
                <div className="flex flex-row items-center">
                    <span className="flex-1 font-title text-xl font-bold">
                        {isOwner ? `Token Management` : `Tokens`}
                    </span>
                    {isOwner &&
                        (showForm ? (
                            <div className="flex gap-2">
                                <Button
                                    onClick={onClickCancelButton}
                                    variant="secondary"
                                >
                                    <span>Cancel</span>
                                </Button>
                                <Button
                                    disabled={!Boolean(payoutTokenData)}
                                    onClick={onClickSaveButton}
                                    variant="primary"
                                >
                                    <span>Apply Changes</span>
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={onClickAddButton}
                                variant="primary"
                                className="gap-3"
                            >
                                <FaPlus /> <span>Add</span>
                            </Button>
                        ))}
                </div>
                {showForm && (
                    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <TokensForm error={error} onChange={onChangeForm} />
                        </div>
                    </div>
                )}
                {isLoadingTargetTokens ? (
                    <div className="flex w-full flex-row justify-center pt-8">
                        <Spinner theme="dark" />
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                        {dataTargetTokens &&
                            dataTargetTokens.map((targetToken) => (
                                <div
                                    key={targetToken.source}
                                    className="flex flex-col gap-4"
                                >
                                    <StatsBoxTwoColumn.Wrapper className="w-full rounded-lg bg-dapp-blue-800 px-5 py-2 text-sm">
                                        <StatsBoxTwoColumn.LeftColumn>
                                            <span className="font-bold">
                                                {targetToken.symbol}
                                            </span>
                                        </StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {chainExplorer && (
                                                <a
                                                    href={chainExplorer.getTokenUrl(
                                                        targetToken.source
                                                    )}
                                                    target="_blank"
                                                    className="flex w-full flex-row items-center justify-end gap-1"
                                                >
                                                    {chainExplorer.name}
                                                    <IoMdOpen />
                                                </a>
                                            )}
                                        </StatsBoxTwoColumn.RightColumn>

                                        <div className="col-span-2">
                                            <CaretDivider />
                                        </div>

                                        <StatsBoxTwoColumn.LeftColumn>
                                            Is payout token?
                                        </StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            <div className="flex items-center justify-end">
                                                {targetToken.isTarget ? (
                                                    <FaRegCheckCircle className="h-5 w-5 text-success" />
                                                ) : (
                                                    <FaRegTimesCircle className="h-5 w-5 text-error" />
                                                )}
                                            </div>
                                        </StatsBoxTwoColumn.RightColumn>

                                        <StatsBoxTwoColumn.LeftColumn>
                                            Enabled as payout?
                                        </StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            <div className="flex items-center justify-end">
                                                {targetToken.isTargetActive ? (
                                                    <FaRegCheckCircle className="h-5 w-5 text-success" />
                                                ) : (
                                                    <FaRegTimesCircle className="h-5 w-5 text-error" />
                                                )}
                                            </div>
                                        </StatsBoxTwoColumn.RightColumn>

                                        <StatsBoxTwoColumn.LeftColumn>
                                            Paid out
                                        </StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {toReadableNumber(
                                                targetToken.rewarded,
                                                targetToken.decimals
                                            )}
                                        </StatsBoxTwoColumn.RightColumn>

                                        <div className="col-span-2">
                                            <CaretDivider />
                                        </div>

                                        <StatsBoxTwoColumn.LeftColumn>
                                            Is reward token?
                                        </StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            <div className="flex items-center justify-end">
                                                {targetToken.isReward ? (
                                                    <FaRegCheckCircle className="h-5 w-5 text-success" />
                                                ) : (
                                                    <FaRegTimesCircle className="h-5 w-5 text-error" />
                                                )}
                                            </div>
                                        </StatsBoxTwoColumn.RightColumn>

                                        <StatsBoxTwoColumn.LeftColumn>
                                            Enabled as reward?
                                        </StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            <div className="flex items-center justify-end">
                                                {targetToken.isRewardActive ? (
                                                    <FaRegCheckCircle className="h-5 w-5 text-success" />
                                                ) : (
                                                    <FaRegTimesCircle className="h-5 w-5 text-error" />
                                                )}
                                            </div>
                                        </StatsBoxTwoColumn.RightColumn>

                                        <StatsBoxTwoColumn.LeftColumn>
                                            Injected
                                        </StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {toReadableNumber(
                                                targetToken.injected,
                                                targetToken.decimals
                                            )}
                                        </StatsBoxTwoColumn.RightColumn>
                                    </StatsBoxTwoColumn.Wrapper>
                                    {isOwner && (
                                        <div className="flex flex-row gap-4">
                                            <Button
                                                disabled={
                                                    togglePayoutTokenAddress ===
                                                    targetToken.source
                                                }
                                                onClick={() =>
                                                    onClickTogglePayoutToken(
                                                        targetToken.source,
                                                        !targetToken.isTargetActive
                                                    )
                                                }
                                                variant={`${
                                                    targetToken.isTargetActive
                                                        ? 'error'
                                                        : 'primary'
                                                }`}
                                                className=" w-full"
                                            >
                                                {togglePayoutTokenAddress ===
                                                targetToken.source ? (
                                                    <Spinner theme="dark" />
                                                ) : targetToken.isTargetActive ? (
                                                    'Disable Payout'
                                                ) : (
                                                    'Enable Payout'
                                                )}
                                            </Button>{' '}
                                            <Button
                                                disabled={
                                                    toggleRewardTokenAddress ===
                                                    targetToken.source
                                                }
                                                onClick={() =>
                                                    onClickToggleRewardToken(
                                                        targetToken.source,
                                                        !targetToken.isRewardActive
                                                    )
                                                }
                                                variant={`${
                                                    targetToken.isRewardActive
                                                        ? 'error'
                                                        : 'primary'
                                                }`}
                                                className=" w-full"
                                            >
                                                {toggleRewardTokenAddress ===
                                                targetToken.source ? (
                                                    <Spinner theme="dark" />
                                                ) : targetToken.isRewardActive ? (
                                                    'Disable Reward'
                                                ) : (
                                                    'Enable Reward'
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </Tile>
            <ApplyChangesConfirmation
                isLoading={isLoadingSetTokens}
                isSuccess={isSuccessSetTokens}
                isPending={isPendingSetTokens}
                isOpen={isApplyChangesModalOpen}
                onClose={() => onConfirmationModalClose()}
                onConfirm={() => onConfirmationModalOK()}
                onCancel={() => onConfirmationModalNOK()}
                error={errorSetTokens}
            />
        </>
    )
}
