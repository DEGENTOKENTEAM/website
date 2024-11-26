import { ManageStakeXContext } from '@dapphelpers/defitools'
import { toReadableNumber } from '@dapphelpers/number'
import { useGetChainExplorer } from '@dapphooks/shared/useGetChainExplorer'
import { RoutingsForTokenResponse } from '@dapphooks/staking/useGetRoutingsForToken'
import { useTokensAdd } from '@dapphooks/staking/useTokensAdd'
import { useTokensEnableReward } from '@dapphooks/staking/useTokensEnableReward'
import { useTokensEnableTarget } from '@dapphooks/staking/useTokensEnableTarget'
import { useTokensGetTokens } from '@dapphooks/staking/useTokensGetTokens'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { Tile } from '@dappshared/Tile'
import { TokenAddParams, TokenInfoResponse } from '@dapptypes'
import clsx from 'clsx'
import { cloneDeep, isUndefined } from 'lodash'
import { useCallback, useContext, useState } from 'react'
import { FaPlus, FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa'
import { IoMdOpen } from 'react-icons/io'
import { Button } from 'src/components/Button'
import { Spinner } from 'src/components/dapp/elements/Spinner'
import { TokensForm } from './tokens/Form'
import { ApplyChangesConfirmation } from './tokens/overlays/ApplyChangesConfirmation'
import { ChangeStateConfirmation } from './tokens/overlays/ChangeStateConfirmation'

export const TokenManagement = () => {
    const {
        data: { protocol, chain, canEdit },
    } = useContext(ManageStakeXContext)

    /// General
    const chainExplorer = useGetChainExplorer(chain!)

    /// Tokens Listing
    const {
        data: dataGetTokens,
        isLoading: isLoadingGetTokens,
        refetch: refetchGetTokens,
    } = useTokensGetTokens(protocol, chain?.id!)

    /// Toggle Tokens Status
    const [toggleRewardToken, setToggleRewardToken] = useState<TokenInfoResponse>()
    const [toggleTargetToken, setToggleTargetToken] = useState<TokenInfoResponse>()
    const [toggleState, setToggleState] = useState<boolean>()
    const [isChangeStateModalOpen, setIsChangeStateModalOpen] = useState(false)

    const {
        write: writeEnableReward,
        token: tokenEnableReward,
        error: errorEnableReward,
        isSuccess: isSuccessEnableReward,
        isLoading: isLoadingEnableReward,
        isPending: isPendingEnableReward,
        reset: resetEnableReward,
    } = useTokensEnableReward(protocol, chain?.id!)

    const {
        write: writeEnableTarget,
        token: tokenEnableTarget,
        error: errorEnableTarget,
        isSuccess: isSuccessEnableTarget,
        isLoading: isLoadingEnableTarget,
        isPending: isPendingEnableTarget,
        reset: resetEnableTarget,
    } = useTokensEnableTarget(protocol, chain?.id!)

    const onToggleRewardState = (token: TokenInfoResponse) => {
        setToggleTargetToken(undefined)
        setToggleRewardToken(token)
        setToggleState(!token.isReward)
        setIsChangeStateModalOpen(true)
    }

    const onTogglePayoutState = (token: TokenInfoResponse) => {
        setToggleTargetToken(token)
        setToggleRewardToken(undefined)
        setToggleState(!token.isTarget)
        setIsChangeStateModalOpen(true)
    }

    const onChangeStateModalOK = useCallback(() => {
        toggleRewardToken &&
            writeEnableReward &&
            writeEnableReward(toggleRewardToken.source, !toggleRewardToken.isReward)
        toggleTargetToken &&
            writeEnableTarget &&
            writeEnableTarget(toggleTargetToken.source, !toggleTargetToken.isTarget)
    }, [toggleRewardToken, toggleTargetToken, writeEnableTarget, writeEnableReward])

    const onChangeStateModalNOK = useCallback(() => {
        resetEnableTarget && resetEnableTarget()
        resetEnableReward && resetEnableReward()
        setIsChangeStateModalOpen(false)
    }, [resetEnableTarget, resetEnableReward])

    const onChangeStateModalClose = useCallback(() => {
        refetchGetTokens && refetchGetTokens()
        resetEnableTarget && resetEnableTarget()
        resetEnableReward && resetEnableReward()
        setIsChangeStateModalOpen(false)
    }, [refetchGetTokens, resetEnableTarget, resetEnableReward])

    /// Add Token
    const [showForm, setShowForm] = useState(false)
    const [tokenAddParams, setTokenAddParams] = useState<TokenAddParams | null>(null)
    const [isApplyChangesModalOpen, setIsApplyChangesModalOpen] = useState(false)

    const {
        isLoading: isLoadingAdd,
        isPending: isPendingAdd,
        error: errorAdd,
        isSuccess: isSuccessAdd,
        reset: resetAdd,
        write: writeAdd,
    } = useTokensAdd(protocol, chain?.id!, tokenAddParams!)

    const onChangeForm = (routings: RoutingsForTokenResponse) => {
        if (!routings) {
            setTokenAddParams(null)
            return
        }

        setTokenAddParams({
            token: routings[0].fromToken.address,
            isReward: false,
            isTarget: false,
            swapGroup: routings.map((route) => ({
                token: route.toToken.address,
                swaps: cloneDeep(route.paths)
                    .reverse()
                    .map((path) => ({
                        calleeSwap: path.dex.router,
                        calleeAmountOut: path.dex.router,
                        path: [path.toToken.address, path.fromToken.address],
                    })),
            })),
        })
    }

    const onClickAddButton = () => {
        resetAdd()
        setShowForm(true)
    }

    const onClickCancelButton = () => {
        resetAdd()
        setTokenAddParams(null)
        setShowForm(false)
    }

    const onClickSaveButton = () => {
        resetAdd()
        setIsApplyChangesModalOpen(true)
    }

    const onConfirmationModalOK = useCallback(() => {
        tokenAddParams && writeAdd && writeAdd()
    }, [writeAdd, tokenAddParams])

    const onConfirmationModalNOK = () => {
        setIsApplyChangesModalOpen(false)
    }

    const onConfirmationModalClose = () => {
        refetchGetTokens && refetchGetTokens()
        setShowForm(false)
        setTokenAddParams(null)
        setIsApplyChangesModalOpen(false)
    }

    return (
        <>
            <Tile className="w-full">
                <div className="flex flex-col gap-4 md:flex-row md:gap-0">
                    <span className="flex-1 font-title text-xl font-bold md:grow">
                        {tokenEnableTarget}
                        {tokenEnableReward}

                        {canEdit ? `Token Management` : `Tokens`}
                    </span>
                    {canEdit &&
                        (showForm ? (
                            <div className="flex w-full gap-2 md:w-auto">
                                <Button
                                    disabled={!Boolean(tokenAddParams)}
                                    onClick={onClickSaveButton}
                                    className="grow md:grow-0"
                                    variant="primary"
                                >
                                    <span>Apply Changes</span>
                                </Button>
                                <Button onClick={onClickCancelButton} variant="secondary">
                                    <span>Cancel</span>
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={onClickAddButton} variant="primary" className="w-full gap-3 md:w-auto">
                                <FaPlus /> <span>Add New Token</span>
                            </Button>
                        ))}
                </div>
                {showForm && chain?.id && (
                    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <TokensForm tokens={dataGetTokens || []} chainId={chain.id} onChange={onChangeForm} />
                        </div>
                    </div>
                )}
                {isLoadingGetTokens ? (
                    <div className="flex w-full flex-row justify-center pt-8">
                        <Spinner theme="dark" />
                    </div>
                ) : (
                    <div
                        className={clsx([
                            'mt-8 grid grid-cols-1 gap-8',
                            dataGetTokens && dataGetTokens.length > 1 && 'md:grid-cols-2',
                        ])}
                    >
                        {dataGetTokens &&
                            dataGetTokens.map((token) => (
                                <div key={token.source} className="flex flex-col gap-4">
                                    <StatsBoxTwoColumn.Wrapper className="w-full rounded-lg bg-dapp-blue-800 px-4 py-2 text-sm">
                                        <StatsBoxTwoColumn.LeftColumn>
                                            <span className="font-bold">{token.symbol}</span>
                                        </StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {chainExplorer && (
                                                <a
                                                    href={chainExplorer.getTokenUrl(token.source)}
                                                    target="_blank"
                                                    rel="noreferrer"
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

                                        <StatsBoxTwoColumn.LeftColumn>Enabled as payout?</StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            <div className="flex items-center justify-end">
                                                {token.isTarget ? (
                                                    <FaRegCheckCircle className="size-5 text-success" />
                                                ) : (
                                                    <FaRegTimesCircle className="size-5 text-error" />
                                                )}
                                            </div>
                                        </StatsBoxTwoColumn.RightColumn>

                                        <StatsBoxTwoColumn.LeftColumn>Paid out</StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {toReadableNumber(token.rewarded, token.decimals)}
                                        </StatsBoxTwoColumn.RightColumn>

                                        <div className="col-span-2">
                                            <CaretDivider />
                                        </div>

                                        <StatsBoxTwoColumn.LeftColumn>Enabled as reward?</StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            <div className="flex items-center justify-end">
                                                {token.isReward ? (
                                                    <FaRegCheckCircle className="size-5 text-success" />
                                                ) : (
                                                    <FaRegTimesCircle className="size-5 text-error" />
                                                )}
                                            </div>
                                        </StatsBoxTwoColumn.RightColumn>

                                        <StatsBoxTwoColumn.LeftColumn>Rewarded</StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {toReadableNumber(token.injected, token.decimals)}
                                        </StatsBoxTwoColumn.RightColumn>
                                    </StatsBoxTwoColumn.Wrapper>
                                    {canEdit && dataGetTokens.length > 1 && (
                                        <div className="flex flex-row gap-4">
                                            <Button
                                                disabled={tokenEnableReward === token.source}
                                                onClick={() => onToggleRewardState(token)}
                                                variant={`${token.isReward ? 'error' : 'primary'}`}
                                                className=" w-full"
                                            >
                                                {tokenEnableReward === token.source ? (
                                                    <Spinner theme="dark" />
                                                ) : token.isReward ? (
                                                    'Disable Reward'
                                                ) : (
                                                    'Enable Reward'
                                                )}
                                            </Button>{' '}
                                            <Button
                                                disabled={tokenEnableTarget === token.source}
                                                onClick={() => onTogglePayoutState(token)}
                                                variant={`${token.isTarget ? 'error' : 'primary'}`}
                                                className=" w-full"
                                            >
                                                {tokenEnableTarget === token.source ? (
                                                    <Spinner theme="dark" />
                                                ) : token.isTarget ? (
                                                    'Disable Payout'
                                                ) : (
                                                    'Enable Payout'
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
                isLoading={isLoadingAdd}
                isSuccess={isSuccessAdd}
                isPending={isPendingAdd}
                isOpen={isApplyChangesModalOpen}
                onClose={() => onConfirmationModalClose()}
                onConfirm={() => onConfirmationModalOK()}
                onCancel={() => onConfirmationModalNOK()}
                error={errorAdd}
            />
            <ChangeStateConfirmation
                isLoading={isLoadingEnableReward || isLoadingEnableTarget}
                isPending={isPendingEnableReward || isPendingEnableTarget}
                isSuccess={isSuccessEnableReward || isSuccessEnableTarget}
                onClose={() => onChangeStateModalClose()}
                onCancel={() => onChangeStateModalNOK()}
                onConfirm={() => onChangeStateModalOK()}
                tokenSymbol={toggleRewardToken?.symbol || toggleTargetToken?.symbol || ''}
                error={errorEnableReward || errorEnableTarget}
                enabled={!isUndefined(toggleState) && toggleState}
                isReward={Boolean(toggleRewardToken)}
                isOpen={isChangeStateModalOpen}
            />
        </>
    )
}
