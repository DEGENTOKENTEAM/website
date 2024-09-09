import { ManageStakeXContextInitialData } from '@dapphelpers/defitools'
import { StakeXContext, StakeXContextDataType } from '@dapphelpers/staking'
import { useActive } from '@dapphooks/staking/useActive'
import { useGetCustomization } from '@dapphooks/staking/useGetCustomization'
import { useGetStableToken } from '@dapphooks/staking/useGetStableToken'
import { useGetStakes } from '@dapphooks/staking/useGetStakes'
import { useGetStakingToken } from '@dapphooks/staking/useGetStakingToken'
import { useGetTargetTokens } from '@dapphooks/staking/useGetTargetTokens'
import { useRunning } from '@dapphooks/staking/useRunning'
import { Tile } from '@dappshared/Tile'
import { WrongChainHint } from '@dappshared/WrongChainHint'
import { TokenInfoResponse } from '@dapptypes'
import { isUndefined } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { FaGear } from 'react-icons/fa6'
import { MdClose } from 'react-icons/md'
import { useParams } from 'react-router-dom'
import { chains, getChainById } from 'shared/supportedChains'
import { Address, Chain } from 'viem'
import { useAccount, useSwitchChain } from 'wagmi'
import { Button } from '../Button'
import { Spinner } from './elements/Spinner'
import { BaseOverlay } from './shared/overlays/BaseOverlay'
import { StakingDetails } from './staking/StakingDetails'
import { StakingForm } from './staking/StakingForm'
import { StakingPayoutTokenSelection } from './staking/StakingPayoutTokenSelection'
import { StakingProjectLogo } from './staking/StakingProjectLogo'
import { StakingStatistics } from './staking/StakingSatistics'
import { StakingTabber, StakingTabberItem } from './staking/StakingTabber'

// TODO disable action when wallet is connected to wrong chain
export const StakeX = () => {
    const { switchChain } = useSwitchChain()
    const { isConnected, isDisconnected, isConnecting, address, chain: chainAccount } = useAccount()

    const [stakingData, setStakingData] = useState<StakeXContextDataType>(ManageStakeXContextInitialData)

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

    //
    // Memoized
    //
    const tabs = useMemo<StakingTabberItem[]>(
        () =>
            [
                {
                    headline: 'Staking',
                    active: true,
                    label: 'New Stake',
                    disabled: false,
                },
                {
                    headline: 'Your Stakes',
                    active: false,
                    label: 'Your Stakes',
                    disabled: !hasStakes,
                },
            ].map((tab, i) => ({ ...tab, active: activeTabIndex == i })),
        [hasStakes, activeTabIndex]
    )

    const availableNetworks = useMemo<{ name: string; chainId: number }[]>(
        () => chains.map(({ name, id }) => ({ name, chainId: id })),
        undefined
    )

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
    const { data: targetTokens } = useGetTargetTokens(stakingData.protocol, stakingData.chain?.id!)
    const { data: stableTokenInfo } = useGetStableToken(stakingData.protocol, stakingData.chain?.id!)
    const { data: stakingTokenInfo } = useGetStakingToken(stakingData.protocol, stakingData.chain?.id!)

    const { response: responseCustomization, load: loadCustomization } = useGetCustomization(
        protocolAddress!,
        Number(chainId)
    )

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
        if (targetTokens && stakingData && stakingData.protocol) {
            let payoutTokenInfo =
                targetTokens.find(
                    (token) =>
                        token.source == JSON.parse(localStorage.getItem(`ptoken${stakingData.protocol}`) || 'null') ||
                        token.source == stableTokenInfo?.source ||
                        token.source == stakingTokenInfo?.source
                ) || targetTokens[0]

            localStorage.setItem(`ptoken${stakingData.protocol}`, JSON.stringify(payoutTokenInfo.source))

            let showTokenInfo =
                targetTokens.find(
                    (token) =>
                        token.source == JSON.parse(localStorage.getItem(`stoken${stakingData.protocol}`) || 'null') ||
                        token.source == stableTokenInfo?.source ||
                        token.source == stakingTokenInfo?.source
                ) || targetTokens[0]

            localStorage.setItem(`stoken${stakingData.protocol}`, JSON.stringify(showTokenInfo.source))

            setSelectedPayoutToken(payoutTokenInfo)
            setSelectedShowToken(showTokenInfo)

            setActiveTargetTokens(targetTokens.filter((token) => token.isTargetActive))

            setIsLoadingSettings(false)
        }
    }, [stakingData, targetTokens, stableTokenInfo, stakingTokenInfo])

    useEffect(() => {
        if (isDisconnected) {
            setHasStakes(false)
            if (activeTabIndex != DEFAULT_TABBER_INDEX) {
                setActiveTabIndex(DEFAULT_TABBER_INDEX)
            }
        }
    }, [isDisconnected, activeTabIndex])

    useEffect(() => {
        setIsUnsupportedNetwork(
            Boolean(isConnected && chain && !availableNetworks.find((_network) => _network.chainId === chain.id))
        )
    }, [chain, isConnected, availableNetworks])

    useEffect(() => {
        const _data = { ...(stakingData || {}) }
        if (protocolAddress) _data.protocol = protocolAddress
        if (chainId) _data.chain = getChainById(Number(chainId))
        if (!isUndefined(dataActive)) _data.isActive = dataActive
        if (!isUndefined(dataRunning)) _data.isRunning = dataRunning
        setStakingData(_data)
    }, [protocolAddress, chainId, dataActive, dataRunning])

    useMemo(() => {
        protocolAddress && chainId && loadCustomization && loadCustomization()
        Number(chainId) && (!chain || chain?.id !== Number(chainId)) && setChain(getChainById(Number(chainId)))
    }, [protocolAddress, chainId, loadCustomization])

    return (
        <StakeXContext.Provider
            value={{
                refetchStakes,
                data: stakingData,
                setData: setStakingData,
            }}
        >
            <div className="mb-5 flex w-full flex-col items-center gap-8">
                <h1 className="flex w-full max-w-2xl flex-row gap-1 px-8 font-title text-3xl font-bold tracking-wide sm:px-0">
                    {stakingTokenInfo && stakingData.protocol && responseCustomization && (
                        <StakingProjectLogo
                            projectName={responseCustomization.data.projectName || ''}
                            source={responseCustomization.data.logoUrl}
                        />
                    )}
                </h1>

                {isUnsupportedNetwork ? (
                    <Tile className="w-full max-w-2xl text-lg leading-10">
                        <div className="flex flex-col justify-center gap-4">
                            <p>The selected network is not supported just yet.</p>
                            {availableNetworks.map(({ chainId, name }, _index) => (
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
                    <>
                        {chainAccount && stakingData && stakingData.chain && (
                            <WrongChainHint
                                chainIdAccount={chainAccount?.id}
                                chainIdProtocol={stakingData.chain?.id}
                                className="max-w-2xl"
                            />
                        )}
                        <StakingStatistics protocol={stakingData.protocol} chainId={stakingData.chain?.id!} />
                        <Tile className="w-full max-w-2xl text-lg leading-6">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Spinner className="!h-10 !w-10" theme="dark" />
                                </div>
                            ) : (
                                <>
                                    <h1 className="mb-5 flex flex-row px-1 font-title text-xl font-bold">
                                        <span>{headline}</span>
                                        {activeTabIndex == 1 && (
                                            <span className="flex flex-grow flex-row justify-end">
                                                <button type="button" onClick={onClickHandler}>
                                                    <FaGear className="h-5 w-5" />
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
                                </>
                            )}
                        </Tile>
                        <BaseOverlay isOpen={showSettings} closeOnBackdropClick={true} onClose={onCloseHandler}>
                            {isLoadingSettings ? (
                                <div className="item-center flex flex-row justify-center">
                                    <Spinner theme="dark" className="m-20 !h-24 !w-24" />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 text-base">
                                    <h3 className="flex flex-row items-center gap-3 font-bold">
                                        <div>Settings</div>
                                        <div>
                                            <FaGear className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-grow justify-end">
                                            <button
                                                type="button"
                                                className="flex items-center justify-end gap-1 text-xs"
                                                onClick={onCloseHandler}
                                            >
                                                <MdClose className="h-5 w-5" />
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
                )}
            </div>
        </StakeXContext.Provider>
    )
}
