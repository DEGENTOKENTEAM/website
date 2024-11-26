import { StakeXContext, StakeXContextDataType, StakeXContextInitialData } from '@dapphelpers/staking'
import { useGetChainExplorer } from '@dapphooks/shared/useGetChainExplorer'
import { useActive } from '@dapphooks/staking/useActive'
import { useGetContractOwner } from '@dapphooks/staking/useGetContractOwner'
import { useGetStakes } from '@dapphooks/staking/useGetStakes'
import { useGetStakingToken } from '@dapphooks/staking/useGetStakingToken'
import { usePaymentGetFeeInNative } from '@dapphooks/staking/usePaymentGetFeeInNative'
import { usePaymentHasActionFee } from '@dapphooks/staking/usePaymentHasActionFee'
import { usePeripheryGet } from '@dapphooks/staking/usePeripheryGet'
import { useRunning } from '@dapphooks/staking/useRunning'
import { useTokensGetTokens } from '@dapphooks/staking/useTokensGetTokens'
import { useUpgraderGetVersion } from '@dapphooks/staking/useUpgraderGetVersion'
import { Tile } from '@dappshared/Tile'
import { WrongChainHint } from '@dappshared/WrongChainHint'
import { TokenInfoResponse } from '@dapptypes'
import clsx from 'clsx'
import { isUndefined } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { FaGear } from 'react-icons/fa6'
import { MdClose } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import { chains, getChainById } from 'shared/supportedChains'
import { Address, Chain } from 'viem'
import { useAccount, useSwitchChain } from 'wagmi'
import { Button } from '../Button'
import logoSmall from './../../images/degenx_logo_small_bg_pattern.png'
import { Spinner } from './elements/Spinner'
import { BaseOverlay } from './shared/overlays/BaseOverlay'
import { StakingDetails } from './staking/StakingDetails'
import { StakingForm } from './staking/StakingForm'
import { StakingPayoutTokenSelection } from './staking/StakingPayoutTokenSelection'
import { StakingStatistics } from './staking/StakingSatistics'
import { StakingTabber, StakingTabberItem } from './staking/StakingTabber'

export const StakeX = () => {
    const { switchChain } = useSwitchChain()
    const { isConnected, isDisconnected, isConnecting, address, chain: chainAccount } = useAccount()

    const [stakingData, setStakingData] = useState<StakeXContextDataType>(StakeXContextInitialData)

    const { protocolAddress, chainId } = useParams<{
        protocolAddress: Address
        chainId: string
    }>()

    const DEFAULT_TABBER_INDEX = 0

    const [activeTabIndex, setActiveTabIndex] = useState<number>(DEFAULT_TABBER_INDEX)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingSettings, setIsLoadingSettings] = useState(true)
    const [isUnsupportedNetwork, setIsUnsupportedNetwork] = useState(true)
    const [isUnsupportedProtocol, setIsUnsupportedProtocol] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [hasStakes, setHasStakes] = useState(false)
    const [headline, setHeadline] = useState<string>()
    const [chain, setChain] = useState<Chain>()

    const [selectedPayoutToken, setSelectedPayoutToken] = useState<TokenInfoResponse>()
    const [selectedShowToken, setSelectedShowToken] = useState<TokenInfoResponse>()
    const [activeTargetTokens, setActiveTargetTokens] = useState<TokenInfoResponse[]>()

    ///
    /// peripheral data
    ///
    const { response: dataPeriphery } = usePeripheryGet(protocolAddress!, chain?.id!)
    const chainExplorer = useGetChainExplorer(chain!)

    ///
    /// Ownership
    ///
    const { data: dataOwner } = useGetContractOwner(protocolAddress!, chain?.id!)
    const { isError: isErrorGetVersion } = useUpgraderGetVersion(protocolAddress!, chain?.id!)

    const {
        data: dataActive,
        isError: isErrorActive,
        error: errorActive,
    } = useActive(stakingData.protocol, stakingData.chain?.id!)
    const { data: dataRunning } = useRunning(stakingData.protocol, stakingData.chain?.id!)
    const { data: stakes, refetch: refetchStakes } = useGetStakes(
        stakingData.protocol,
        stakingData.chain?.id!,
        address!,
        true
    )
    const { data: dataGetTokens } = useTokensGetTokens(stakingData.protocol, stakingData.chain?.id!)
    const { data: stakingTokenInfo } = useGetStakingToken(stakingData.protocol, stakingData.chain?.id!)

    //
    // Memoized
    //
    const tabs = useMemo<StakingTabberItem[]>(
        () =>
            [
                {
                    headline: `Deposit your ${stakingTokenInfo ? stakingTokenInfo.symbol : 'Tokens'} for staking`,
                    active: true,
                    label: `Deposit ${stakingTokenInfo ? stakingTokenInfo.symbol : 'Tokens'}`,
                    disabled: false,
                },
                {
                    headline: 'Your Stakes',
                    active: false,
                    label: 'Your Stakes',
                    disabled: !hasStakes,
                },
            ].map((tab, i) => ({ ...tab, active: activeTabIndex == i })),
        [hasStakes, activeTabIndex, stakingTokenInfo]
    )

    // Action Fees
    const { data: dataHasActionFee } = usePaymentHasActionFee(stakingData.protocol, stakingData.chain?.id!)
    const { data: dataGetFeeInNative, error } = usePaymentGetFeeInNative(stakingData.protocol, stakingData.chain?.id!)

    const onClickHandler = () => {
        setShowSettings(true)
    }

    const onCloseHandler = () => {
        setShowSettings(false)
    }

    const onSelectPayoutTokenHandler = (tokenInfo: TokenInfoResponse) => {
        setSelectedPayoutToken(tokenInfo)
        localStorage.setItem(`ptoken${stakingData.protocol}`, JSON.stringify(tokenInfo.source))
    }

    const onSelectShowTokenHandler = (tokenInfo: TokenInfoResponse) => {
        setSelectedShowToken(tokenInfo)
        localStorage.setItem(`stoken${stakingData.protocol}`, JSON.stringify(tokenInfo.source))
    }

    const onDepositSuccessHandler = () => {
        refetchStakes()
        setActiveTabIndex(1)
    }

    useEffect(() => {
        isErrorActive && (errorActive as any).name == 'ContractFunctionExecutionError' && setIsUnsupportedProtocol(true)
    }, [isErrorActive, errorActive])

    useEffect(() => {
        setHeadline(tabs[activeTabIndex]?.headline)
    }, [tabs, activeTabIndex])

    useEffect(() => {
        if (isConnected) {
            if (stakes) {
                setHasStakes(stakes.length > 0)
                if (stakes.length > 0) setActiveTabIndex(1)
                else setActiveTabIndex(DEFAULT_TABBER_INDEX)
            }
        }
        setIsLoading(false)
    }, [isConnected, stakes])

    useEffect(() => {
        if (dataGetTokens && stakingData && stakingData.protocol) {
            let payoutTokenInfo =
                dataGetTokens.find(
                    (token) =>
                        token.source == JSON.parse(localStorage.getItem(`ptoken${stakingData.protocol}`) || 'null') ||
                        token.source == stakingTokenInfo?.source
                ) || dataGetTokens[0]

            localStorage.setItem(`ptoken${stakingData.protocol}`, JSON.stringify(payoutTokenInfo.source))

            let showTokenInfo =
                dataGetTokens.find(
                    (token) =>
                        token.source == JSON.parse(localStorage.getItem(`stoken${stakingData.protocol}`) || 'null') ||
                        token.source == stakingTokenInfo?.source
                ) || dataGetTokens[0]

            localStorage.setItem(`stoken${stakingData.protocol}`, JSON.stringify(showTokenInfo.source))

            setSelectedPayoutToken(payoutTokenInfo)
            setSelectedShowToken(showTokenInfo)

            setActiveTargetTokens(dataGetTokens.filter((token) => token.isTarget))

            setIsLoadingSettings(false)
        }
    }, [stakingData, dataGetTokens, stakingTokenInfo])

    useEffect(() => {
        if (isDisconnected) {
            setHasStakes(false)
            if (activeTabIndex != DEFAULT_TABBER_INDEX) {
                setActiveTabIndex(DEFAULT_TABBER_INDEX)
            }
        }
    }, [isDisconnected, activeTabIndex])

    useEffect(() => {
        setIsUnsupportedNetwork(Boolean(isConnected && chain && !chains.find((_chain) => _chain.id === chain.id)))
    }, [chain, isConnected])

    useEffect(() => {
        const _data = { ...(StakeXContextInitialData || {}) }
        if (protocolAddress) _data.protocol = protocolAddress
        if (chainId) _data.chain = getChainById(Number(chainId))
        if (!isUndefined(dataActive)) _data.isActive = dataActive
        if (!isUndefined(dataRunning)) _data.isRunning = dataRunning
        if (!isUndefined(dataGetTokens)) _data.tokens = dataGetTokens
        if (!isUndefined(dataHasActionFee)) _data.actionFeeActive = dataHasActionFee
        if (!isUndefined(dataGetFeeInNative)) {
            _data.actionFee = dataGetFeeInNative.fee
            _data.actionFeeThreshold = dataGetFeeInNative.thresholdFee
        }
        setStakingData(_data)
    }, [dataGetTokens, protocolAddress, chainId, dataActive, dataRunning, dataHasActionFee, dataGetFeeInNative])

    useMemo(() => {
        Number(chainId) && (!chain || chain?.id !== Number(chainId)) && setChain(getChainById(Number(chainId)))
    }, [chainId, chain])

    if (isLoading) return <></>

    return (
        <StakeXContext.Provider
            value={{
                refetchStakes,
                data: stakingData,
                setData: setStakingData,
            }}
        >
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
                                    ? `radial-gradient(circle at center, #00000000 , #000000FF), url(${dataPeriphery.data.heroBannerUrl})`
                                    : `radial-gradient(circle at center, #00000000 , #000000FF), url('${logoSmall.src}')`,
                        }}
                    >
                        <div
                            className={clsx([
                                'size-24 -mb-12 flex flex-row items-center justify-center rounded-full bg-dapp-blue-800 bg-contain bg-center bg-no-repeat shadow-md shadow-dapp-blue-800',
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
                                <span className="text-4xl font-bold">{stakingTokenInfo?.symbol[0]}</span>
                            )}
                        </div>
                    </div>
                </Tile>

                {isErrorGetVersion ? (
                    <Tile className="flex w-full flex-row justify-center p-8 text-center">
                        We are about to update our staking &nbsp;🚧 <br />
                        <br />
                        <br />
                        Soon you will have more features &nbsp;🤘&nbsp; Give us some minutes &nbsp;⏱️
                    </Tile>
                ) : (
                    <>
                        <div className="m-auto flex w-full flex-col items-center gap-8">
                            {isUnsupportedNetwork ? (
                                <Tile className="w-full max-w-2xl text-lg leading-10">
                                    <div className="flex flex-col justify-center gap-4">
                                        <p>The selected network is not supported just yet.</p>
                                        {chains.map(({ id: chainId, name }, _index) => (
                                            <Button
                                                key={_index}
                                                variant="primary"
                                                disabled={isConnecting}
                                                onClick={() => {
                                                    switchChain({ chainId })
                                                }}
                                            >
                                                Switch to {name}
                                            </Button>
                                        ))}
                                    </div>
                                </Tile>
                            ) : isUnsupportedProtocol ? (
                                <Tile className="w-full max-w-2xl">
                                    <p className="text-center text-lg leading-8">
                                        The protocol with the given address{' '}
                                        <span className="block rounded-md bg-dapp-blue-800 p-1 font-mono">
                                            {stakingData.protocol}
                                        </span>{' '}
                                        does not exist on this network
                                        <br />
                                        <br />
                                        Please check your source of information
                                    </p>
                                </Tile>
                            ) : (
                                dataActive && (
                                    <>
                                        {chainAccount && stakingData && stakingData.chain && (
                                            <WrongChainHint
                                                chainIdAccount={chainAccount?.id}
                                                chainIdProtocol={stakingData.chain?.id}
                                                className="max-w-2xl"
                                            />
                                        )}
                                        <Tile className="w-full max-w-2xl text-lg leading-6">
                                            <h1 className="mb-5 flex flex-row px-1 font-title text-xl font-bold">
                                                <span>{headline}</span>
                                                {activeTabIndex == 1 && (
                                                    <span className="flex grow flex-row justify-end">
                                                        <button type="button" onClick={onClickHandler}>
                                                            <FaGear className="size-5" />
                                                        </button>
                                                    </span>
                                                )}
                                            </h1>
                                            <StakingTabber tabs={tabs} setActiveTab={setActiveTabIndex} />
                                            <div className="mt-8">
                                                {stakingTokenInfo && activeTabIndex == 0 && (
                                                    <StakingForm
                                                        onDepositSuccessHandler={onDepositSuccessHandler}
                                                        stakingTokenInfo={stakingTokenInfo}
                                                    />
                                                )}
                                                {stakingTokenInfo &&
                                                    selectedPayoutToken &&
                                                    selectedShowToken &&
                                                    stakes &&
                                                    activeTabIndex == 1 && (
                                                        <StakingDetails
                                                            stakingTokenInfo={stakingTokenInfo}
                                                            defaultPayoutToken={selectedPayoutToken}
                                                            defaultShowToken={selectedShowToken}
                                                            stakes={stakes}
                                                        />
                                                    )}
                                            </div>
                                        </Tile>
                                        <BaseOverlay
                                            isOpen={showSettings}
                                            closeOnBackdropClick={true}
                                            onClose={onCloseHandler}
                                        >
                                            {isLoadingSettings ? (
                                                <div className="flex flex-row items-center justify-center">
                                                    <Spinner theme="dark" className="!size-24 m-20" />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-4 text-base">
                                                    <h3 className="flex flex-row items-center gap-3 font-bold">
                                                        <div>Settings</div>
                                                        <div>
                                                            <FaGear className="size-4" />
                                                        </div>
                                                        <div className="flex grow justify-end">
                                                            <button
                                                                type="button"
                                                                className="flex items-center justify-end gap-1 text-xs"
                                                                onClick={onCloseHandler}
                                                            >
                                                                <MdClose className="size-5" />
                                                            </button>
                                                        </div>
                                                    </h3>

                                                    {activeTargetTokens && selectedShowToken && (
                                                        <StakingPayoutTokenSelection
                                                            headline="View Token"
                                                            description="Choose an asset which will be used in the UI to show your estimated rewards"
                                                            tokens={activeTargetTokens}
                                                            selectedToken={selectedShowToken}
                                                            onSelect={onSelectShowTokenHandler}
                                                        />
                                                    )}

                                                    {activeTargetTokens && selectedPayoutToken && (
                                                        <StakingPayoutTokenSelection
                                                            description="Choose an asset which will be the pre-selected payout token for claiming. You can change this asset during the claiming process"
                                                            tokens={activeTargetTokens}
                                                            selectedToken={selectedPayoutToken}
                                                            onSelect={onSelectPayoutTokenHandler}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </BaseOverlay>
                                    </>
                                )
                            )}
                        </div>
                        <StakingStatistics protocol={stakingData.protocol} chainId={stakingData.chain?.id!} />
                    </>
                )}
            </div>
            <div className="mb-8 flex flex-col gap-4 text-center text-sm opacity-50">
                {stakingTokenInfo && (
                    <span>
                        Staking Token Address{' '}
                        <a
                            href={chainExplorer?.getTokenUrl(stakingTokenInfo.source)}
                            className="text-dapp-cyan-500 underline"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {stakingTokenInfo.source}
                        </a>
                    </span>
                )}
                {isConnected && dataOwner && address == dataOwner && (
                    <Link to={`./../../../defitools/stakex/regulars/manage/${chainId}/${protocolAddress}`}>
                        Manage Staking
                    </Link>
                )}
            </div>
        </StakeXContext.Provider>
    )
}
