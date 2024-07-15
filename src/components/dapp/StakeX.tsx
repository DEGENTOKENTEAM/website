import { STAKEX_ADDRESS } from '@dappconstants'
import { StakeXContext } from '@dapphelpers/staking'
import { useActive } from '@dapphooks/staking/useActive'
import { useGetStableToken } from '@dapphooks/staking/useGetStableToken'
import { useGetStakes } from '@dapphooks/staking/useGetStakes'
import { useGetStakingToken } from '@dapphooks/staking/useGetStakingToken'
import { useGetTargetTokens } from '@dapphooks/staking/useGetTargetTokens'
import { Tile } from '@dappshared/Tile'
import { TokenInfoResponse } from '@dapptypes'
import { ConnectKitButton } from 'connectkit'
import { useEffect, useMemo, useState } from 'react'
import { FaGear } from 'react-icons/fa6'
import { MdClose } from 'react-icons/md'
import { useParams } from 'react-router-dom'
import { Address } from 'viem'
import { useAccount, useSwitchChain } from 'wagmi'
import { Button } from '../Button'
import { Spinner } from './elements/Spinner'
import { StakingDetails } from './staking/StakingDetails'
import { StakingForm } from './staking/StakingForm'
import { StakingPayoutTokenSelection } from './staking/StakingPayoutTokenSelection'
import { StakingStatistics } from './staking/StakingSatistics'
import { StakingTabber, StakingTabberItem } from './staking/StakingTabber'
import { BaseOverlay } from './shared/overlays/BaseOverlay'

export const StakeX = () => {
    const { switchChain } = useSwitchChain()
    const { isConnected, isDisconnected, isConnecting, address, chain } =
        useAccount()

    const { hash } = useParams()

    const DEFAULT_TABBER_INDEX = 0

    const [activeTabIndex, setActiveTabIndex] =
        useState<number>(DEFAULT_TABBER_INDEX)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingSettings, setIsLoadingSettings] = useState(true)
    const [isUnsupportedNetwork, setIsUnsupportedNetwork] = useState(true)
    const [isUnsupportedProtocol, setIsUnsupportedProtocol] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [hasStakes, setHasStakes] = useState(false)
    const [headline, setHeadline] = useState<string>()

    const [selectedPayoutToken, setSelectedPayoutToken] =
        useState<TokenInfoResponse>()
    const [selectedShowToken, setSelectedShowToken] =
        useState<TokenInfoResponse>()
    const [activeTargetTokens, setActiveTargetTokens] =
        useState<TokenInfoResponse[]>()

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

    const availableNetworks = useMemo(() => {
        const _networks = [{ name: 'Avalanche Mainnet', chainId: 43114 }]
        if (Boolean(process.env.NEXT_PUBLIC_ENABLE_TESTNETS))
            _networks.push({ name: 'Avalanche Testnet', chainId: 43113 })
        if (Boolean(process.env.NEXT_PUBLIC_ENABLE_LOCALFORK))
            _networks.push({ name: 'Localfork', chainId: 1337 })
        return _networks
    }, [])

    const protocolAddress = useMemo<Address>(() => {
        return (hash || STAKEX_ADDRESS) as Address
    }, [hash])

    const { isError: isErrorActive, error: errorActive } =
        useActive(protocolAddress)

    const { data: stakes, refetch: refetchStakes } = useGetStakes(
        isConnected,
        protocolAddress,
        address!
    )
    const { data: targetTokens } = useGetTargetTokens(protocolAddress)
    const { data: stableTokenInfo } = useGetStableToken(protocolAddress)
    const { data: stakingTokenInfo } = useGetStakingToken(protocolAddress)

    const onClickHandler = () => {
        setShowSettings(true)
    }

    const onCloseHandler = () => {
        setShowSettings(false)
    }

    const onSelectPayoutTokenHandler = (tokenInfo: TokenInfoResponse) => {
        setSelectedPayoutToken(tokenInfo)
        localStorage.setItem('ptoken', JSON.stringify(tokenInfo.source))
    }

    const onSelectShowTokenHandler = (tokenInfo: TokenInfoResponse) => {
        setSelectedShowToken(tokenInfo)
        localStorage.setItem('stoken', JSON.stringify(tokenInfo.source))
    }

    const onDepositSuccessHandler = () => {
        refetchStakes()
        setActiveTabIndex(1)
    }

    useEffect(() => {
        isErrorActive &&
            (errorActive as any).name == 'ContractFunctionExecutionError' &&
            setIsUnsupportedProtocol(true)
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
        if (targetTokens) {
            // if there is a stable token, it'll be used by default, otherwise the staking tokenß
            let payoutToken = JSON.parse(
                localStorage.getItem('ptoken') || 'null'
            )
            if (!payoutToken) {
                payoutToken = (stableTokenInfo || stakingTokenInfo)?.source
                if (payoutToken)
                    localStorage.setItem('ptoken', JSON.stringify(payoutToken))
            }

            let showToken = JSON.parse(localStorage.getItem('stoken') || 'null')
            if (!showToken) {
                showToken = (stableTokenInfo || stakingTokenInfo)?.source
                if (showToken)
                    localStorage.setItem('stoken', JSON.stringify(showToken))
            }

            setSelectedPayoutToken(
                targetTokens.find((token) => token.source == payoutToken) ||
                    stakingTokenInfo
            )
            setSelectedShowToken(
                targetTokens.find((token) => token.source == showToken) ||
                    stakingTokenInfo
            )

            setActiveTargetTokens(
                targetTokens.filter((token) => token.isTargetActive)
            )

            setIsLoadingSettings(false)
        }
    }, [targetTokens, stableTokenInfo, stakingTokenInfo])

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
            Boolean(
                isConnected &&
                    chain &&
                    !availableNetworks.find(
                        (_network) => _network.chainId === chain.id
                    )
            )
        )
    }, [chain, isConnected, availableNetworks])

    return (
        <StakeXContext.Provider value={{ refetchStakes }}>
            <div className="mb-5 flex w-full flex-col items-center gap-8">
                <h1 className="flex w-full max-w-2xl flex-row gap-1 px-8 font-title text-3xl font-bold tracking-wide sm:px-0">
                    <span className="text-techGreen">STAKE</span>
                    <span className="text-degenOrange">X</span>
                </h1>

                {isConnected ? (
                    isUnsupportedNetwork ? (
                        <Tile className="w-full max-w-2xl text-lg leading-10">
                            <div className="flex flex-col justify-center gap-4">
                                <p>
                                    The selected network is not supported just
                                    yet.
                                </p>
                                {availableNetworks.map(
                                    ({ chainId, name }, _index) => (
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
                                    )
                                )}
                            </div>
                        </Tile>
                    ) : isUnsupportedProtocol ? (
                        <Tile className="w-full max-w-2xl">
                            <p className="text-center text-lg leading-8">
                                Please check if you&apos;re connected to the
                                corrected network <br /> <br />
                                If you&apos;ve selected the correct network,
                                then the given protocol address{' '}
                                <span className="block rounded-md bg-dapp-blue-800 p-1 font-mono">
                                    {protocolAddress}
                                </span>{' '}
                                is not supported on it <br />
                                <br />
                                Please check your source of information
                            </p>
                        </Tile>
                    ) : (
                        <>
                            <StakingStatistics protocol={protocolAddress} />
                            <Tile className="w-full max-w-2xl text-lg leading-6">
                                {isLoading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <Spinner
                                            className="!h-10 !w-10"
                                            theme="dark"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="mb-5 flex flex-row px-1 font-title text-xl font-bold">
                                            <span>{headline}</span>
                                            {activeTabIndex == 1 && (
                                                <span className="flex flex-grow flex-row justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={onClickHandler}
                                                    >
                                                        <FaGear className="h-5 w-5" />
                                                    </button>
                                                </span>
                                            )}
                                        </h1>
                                        <StakingTabber
                                            tabs={tabs}
                                            setActiveTab={setActiveTabIndex}
                                        />
                                        <div className="mt-8">
                                            {stakingTokenInfo &&
                                                activeTabIndex == 0 && (
                                                    <StakingForm
                                                        protocolAddress={
                                                            protocolAddress
                                                        }
                                                        onDepositSuccessHandler={
                                                            onDepositSuccessHandler
                                                        }
                                                        stakingTokenInfo={
                                                            stakingTokenInfo
                                                        }
                                                    />
                                                )}
                                            {stakingTokenInfo &&
                                                selectedPayoutToken &&
                                                selectedShowToken &&
                                                stakes &&
                                                activeTabIndex == 1 && (
                                                    <StakingDetails
                                                        protocolAddress={
                                                            protocolAddress
                                                        }
                                                        stakingTokenInfo={
                                                            stakingTokenInfo
                                                        }
                                                        defaultPayoutToken={
                                                            selectedPayoutToken
                                                        }
                                                        defaultShowToken={
                                                            selectedShowToken
                                                        }
                                                        stakes={stakes}
                                                    />
                                                )}
                                        </div>
                                    </>
                                )}
                            </Tile>
                            <BaseOverlay
                                isOpen={showSettings}
                                closeOnBackdropClick={true}
                                onClose={onCloseHandler}
                            >
                                {isLoadingSettings ? (
                                    <div className="item-center flex flex-row justify-center">
                                        <Spinner
                                            theme="dark"
                                            className="m-20 !h-24 !w-24"
                                        />
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

                                        {activeTargetTokens &&
                                            selectedShowToken && (
                                                <StakingPayoutTokenSelection
                                                    headline="View Token"
                                                    description="Choose an asset which will be used in the UI to show your estimated rewards"
                                                    tokens={activeTargetTokens}
                                                    selectedToken={
                                                        selectedShowToken
                                                    }
                                                    onSelect={
                                                        onSelectShowTokenHandler
                                                    }
                                                />
                                            )}

                                        {activeTargetTokens &&
                                            selectedPayoutToken && (
                                                <StakingPayoutTokenSelection
                                                    description="Choose an asset which will be the pre-selected payout token for claiming. You can change this asset during the claiming process"
                                                    tokens={activeTargetTokens}
                                                    selectedToken={
                                                        selectedPayoutToken
                                                    }
                                                    onSelect={
                                                        onSelectPayoutTokenHandler
                                                    }
                                                />
                                            )}
                                    </div>
                                )}
                            </BaseOverlay>
                        </>
                    )
                ) : (
                    <ConnectKitButton.Custom>
                        {({ isConnecting, show }) => {
                            return (
                                <Tile className="w-full max-w-2xl text-lg leading-10">
                                    <h2 className="mb-4 text-2xl font-bold">
                                        Welcome to STAKEX Staking Protocol
                                    </h2>
                                    <p>
                                        You&apos;ll find more information about
                                        STAKEX in our{' '}
                                        <a
                                            href="https://docs.dgnx.finance/degenx-ecosystem/Products/stakex/introduction"
                                            title="Link to documentation section of STAKEX protocol"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-dapp-cyan-500"
                                        >
                                            documentation
                                        </a>{' '}
                                        section.
                                    </p>
                                    <p className="pb-4">
                                        In order to stake{' '}
                                        {stakingTokenInfo?.symbol}, you need to
                                        connect your wallet.
                                    </p>
                                    <Button
                                        variant="primary"
                                        disabled={isConnecting}
                                        onClick={show}
                                    >
                                        Connect your wallet
                                    </Button>
                                </Tile>
                            )
                        }}
                    </ConnectKitButton.Custom>
                )}
            </div>
        </StakeXContext.Provider>
    )
}
