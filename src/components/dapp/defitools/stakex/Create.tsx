import { DAppContext } from '@dapphelpers/dapp'
import { useDeployProtocolSTAKEX } from '@dapphooks/deployer/useDeployProtocolSTAKEX'
import { useGetReferrerById } from '@dapphooks/deployer/useGetReferrerById'
import { useGetTokenInfo } from '@dapphooks/shared/useGetTokenInfo'
import { NetworkSelectorForm } from '@dappshared/NetworkSelectorForm'
import { Tile } from '@dappshared/Tile'
import { TokenSearchInput } from '@dappshared/TokenSearchInput'
import { STAKEXCreatorData, STAKEXCreatorDataInitParams, STAKEXDeployArgs } from '@dapptypes'
import { ConnectKitButton } from 'connectkit'
import { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getChainById } from 'shared/supportedChains'
import { Button } from 'src/components/Button'
import { useLocalStorage } from 'usehooks-ts'
import { Address, Chain, encodeFunctionData, parseAbi, zeroAddress } from 'viem'
import { useAccount, useConnect, useSwitchChain } from 'wagmi'
import protocols from './../../../../../config/protocols'
import { CreateProtocolConfirmation } from './create/overlays/CreateProtocolConfirmation'

const initParams: STAKEXCreatorDataInitParams = {
    stakingToken: null,
    rewardToken: null,
    manager: null,
}

const initDeployArgs: STAKEXDeployArgs = {
    referrer: zeroAddress,
    enableCampaignMode: false,
    initContract: zeroAddress,
    initFn: '',
    initParams,
}

const initStorageData: STAKEXCreatorData = {
    chainId: 0,
    deployArgs: initDeployArgs,
}

type CreateProps = {
    enableCampaignMode?: boolean
}
export const Create = ({ enableCampaignMode }: CreateProps) => {
    const { setTitle } = useContext(DAppContext)
    const navigate = useNavigate()
    const { isConnected, chainId, address: addressConnected } = useAccount()
    const { switchChain } = useSwitchChain()
    const { connect } = useConnect()
    const [searchParams] = useSearchParams()
    const [storedRef, saveStoredRef] = useLocalStorage<Address>('stakexRef', zeroAddress)
    const chainIds = Object.keys(protocols).map((v) => +v)
    const networks = chainIds.map((id) => getChainById(id))

    const [data, setData] = useState<STAKEXCreatorData>(initStorageData)
    const [isValid, setIsValid] = useState(false)
    const [selectedChain, setSelectedChain] = useState<Chain>(getChainById(Number(process.env.NEXT_PUBLIC_CHAIN_ID)))
    const [deployerAddress, setDeployerAddress] = useState<Address>()
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)

    // staking token selection
    const [stakingTokenAddress, setStakingTokenAddress] = useState<Address | null>(null)
    const [isStakingTokenSearchActive, setIsStakingTokenSearchActive] = useState(false)

    // reward token selection
    const [rewardTokenAddress, setRewardTokenAddress] = useState<Address | null>(null)
    const [isRewardTokenSearchActive, setIsRewardTokenSearchActive] = useState(false)

    // deployment parameter
    const [deploymentParams, setDeploymentParams] = useState<STAKEXDeployArgs | null>(null)

    const { data: dataReferrer } = useGetReferrerById(deployerAddress!, selectedChain?.id!, storedRef!)

    const {
        error: errorStakingTokenInfo,
        isLoading: isLoadingStakingTokenInfo,
        data: dataStakingTokenInfo,
        refetch: refetchStakingTokenInfo,
    } = useGetTokenInfo({
        token: stakingTokenAddress!,
        chainId: selectedChain?.id!,
    })

    const {
        error: errorRewardTokenInfo,
        isLoading: isLoadingRewardTokenInfo,
        data: dataRewardTokenInfo,
        refetch: refetchRewardTokenInfo,
    } = useGetTokenInfo({
        token: rewardTokenAddress!,
        chainId: selectedChain?.id!,
    })

    const {
        write: writeDeployProtocol,
        reset: resetDeployProtocol,
        isLoading: isLoadingDeployProtocol,
        isPending: isPendingDeployProtocol,
        error: errorDeployProtocol,
        isSuccess: isSuccessDeployProtocol,
        deployedProtocol,
    } = useDeployProtocolSTAKEX(deployerAddress!, selectedChain?.id!, deploymentParams!, isValid && isConnected)

    const onChangeSelectedNetwork = (chain: Chain) => setSelectedChain(chain)

    const onChangeStakingTokenAddress = (e: ChangeEvent<HTMLInputElement>) => {
        const { validity, value } = e.target

        // resetError()
        setStakingTokenAddress(null)
        setIsStakingTokenSearchActive(false)

        if (validity.valid) {
            setIsStakingTokenSearchActive(true)
            setStakingTokenAddress(value as Address)
        }
    }

    const onChangeRewardTokenAddress = (e: ChangeEvent<HTMLInputElement>) => {
        const { validity, value } = e.target

        // resetError()
        setRewardTokenAddress(null)
        setIsRewardTokenSearchActive(false)

        if (validity.valid) {
            setIsRewardTokenSearchActive(true)
            setRewardTokenAddress(value as Address)
        }
    }

    //
    // confirmation modal
    //
    const onClickCreate = () => {
        setIsConfirmationModalOpen(true)
    }

    const onConfirmationModalClose = () => {
        setIsConfirmationModalOpen(false)
        navigate(`./../manage/${selectedChain?.id}/${deployedProtocol}`, { relative: 'route' })
    }

    const onConfirmationModalOK = useCallback(() => {
        writeDeployProtocol && writeDeployProtocol()
    }, [writeDeployProtocol])

    const onConfirmationModalNOK = useCallback(() => {
        setIsConfirmationModalOpen(false)
        resetDeployProtocol && resetDeployProtocol()
    }, [resetDeployProtocol])

    useEffect(() => {
        if (!selectedChain || !protocols) return

        const _data: STAKEXCreatorData = {
            chainId: selectedChain.id,
            deployArgs: {
                referrer: dataReferrer && dataReferrer.active ? dataReferrer.account : zeroAddress,
                initContract: protocols[selectedChain.id].stakex.init,
                initFn: encodeFunctionData({
                    abi: parseAbi(['function init(address)']),
                    functionName: 'init',
                    args: [protocols[selectedChain.id].deployer],
                }),
                initParams: {
                    rewardToken: dataRewardTokenInfo && dataRewardTokenInfo.symbol ? dataRewardTokenInfo.source : null,
                    stakingToken:
                        dataStakingTokenInfo && dataStakingTokenInfo.symbol ? dataStakingTokenInfo.source : null,
                    manager: addressConnected ? addressConnected : null,
                },
                enableCampaignMode: Boolean(enableCampaignMode),
            },
        }
        setData(_data)
    }, [selectedChain, dataReferrer, dataStakingTokenInfo, dataRewardTokenInfo, addressConnected, enableCampaignMode])

    useEffect(() => {
        if (!data) return

        const { deployArgs } = data

        const _valid = Boolean(
            deployArgs.referrer &&
                deployArgs.initContract &&
                deployArgs.initFn &&
                deployArgs.initParams.manager &&
                deployArgs.initParams.stakingToken &&
                deployArgs.initParams.rewardToken
        )

        setIsValid(_valid)
        setDeploymentParams(_valid ? deployArgs : initDeployArgs)
    }, [data])

    useEffect(() => {
        setDeployerAddress(selectedChain ? protocols[selectedChain.id].deployer : undefined)
    }, [selectedChain, refetchRewardTokenInfo, refetchStakingTokenInfo])

    useEffect(() => {
        if (searchParams && saveStoredRef) {
            const ref = searchParams.get('ref') as Address
            saveStoredRef(ref)
            searchParams.delete('ref')
        }
    }, [searchParams, saveStoredRef])

    useEffect(() => {
        setTitle('STAKEX Creator')
    })

    return (
        <>
            <div className="mb-8 flex w-full max-w-7xl flex-col gap-8">
                <h1 className="flex w-full flex-col items-start gap-1 px-8 font-title text-3xl font-bold tracking-wide sm:px-0 md:flex-row md:gap-4">
                    <span>
                        <span className="text-techGreen">STAKE</span>
                        <span className="text-degenOrange">X</span>
                    </span>
                    {enableCampaignMode ? <span>Create Campaign Staking</span> : <span>Create Flexible Staking</span>}
                </h1>
                <Tile className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <span className="text-lg font-bold">Select your network</span>
                        {selectedChain && (
                            <NetworkSelectorForm
                                chains={networks}
                                selectedChain={selectedChain}
                                onChange={onChangeSelectedNetwork}
                            />
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-1 flex-col gap-2 px-2">
                            <span className="text-lg font-bold">Enter Staking Token Address</span>
                            <span className="text-xs">
                                Please enter the address of the token that your stakers need to deposit to the protocol
                                in order to stake.
                            </span>
                        </div>

                        {selectedChain && (
                            <TokenSearchInput
                                error={errorStakingTokenInfo?.message || ''}
                                tokenInfo={dataStakingTokenInfo}
                                isLoadingTokenInfo={isLoadingStakingTokenInfo}
                                isSearchActive={isStakingTokenSearchActive}
                                onChangeTokenAddress={onChangeStakingTokenAddress}
                            />
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-1 flex-col gap-2 px-2">
                            <span className="text-lg font-bold">Enter Reward Token Address</span>
                            <span className="text-xs">
                                Please enter the address of the token that you want to reward to your stakers.
                            </span>
                        </div>
                        {selectedChain && (
                            <TokenSearchInput
                                error={errorRewardTokenInfo?.message || ''}
                                tokenInfo={dataRewardTokenInfo}
                                isLoadingTokenInfo={isLoadingRewardTokenInfo}
                                isSearchActive={isRewardTokenSearchActive}
                                onChangeTokenAddress={onChangeRewardTokenAddress}
                            />
                        )}
                    </div>
                    {/* 
                        // TODO add this video later on
                        <div className="flex flex-col px-2">
                            <span className="text-lg font-bold">Watch how to create a staking protocol</span>
                            <div>VIDEO VIDEO VIDEO</div>
                        </div> */}

                    <div className="flex w-full flex-col gap-1">
                        {isConnected ? (
                            chainId && selectedChain && Number(chainId) == selectedChain.id ? (
                                <Button
                                    disabled={!isValid}
                                    onClick={onClickCreate}
                                    variant="primary"
                                    className="h-20 w-full text-xl"
                                >
                                    {enableCampaignMode ? (
                                        <span>Create FREE Campaign Staking</span>
                                    ) : (
                                        <span>Create FREE Flexible Staking</span>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => switchChain({ chainId: selectedChain?.id! })}
                                    variant="primary"
                                    className="h-20 w-full text-xl"
                                >
                                    Change Network to {selectedChain?.name}
                                </Button>
                            )
                        ) : (
                            <ConnectKitButton.Custom>
                                {({ isConnecting, show }) => {
                                    return (
                                        <Button onClick={show} variant="primary" className="h-20 w-full text-xl">
                                            {isConnecting ? 'Connecting...' : 'Connect Your Wallet'}
                                        </Button>
                                    )
                                }}
                            </ConnectKitButton.Custom>
                        )}
                        <span className="flex items-center gap-2 px-2 text-sm">
                            * gas has to paid separately and can differ between networks
                        </span>
                    </div>
                </Tile>
                {/* <Introduction /> */}
            </div>
            <CreateProtocolConfirmation
                isLoading={isLoadingDeployProtocol}
                isPending={isPendingDeployProtocol}
                isOpen={isConfirmationModalOpen}
                isSuccess={isSuccessDeployProtocol}
                onCancel={onConfirmationModalNOK}
                onConfirm={onConfirmationModalOK}
                onClose={onConfirmationModalClose}
                closeOnBackdropClick={false}
                error={errorDeployProtocol}
            >
                With this action, you will deploy your custom STAKEX staking solution to the {selectedChain?.name}{' '}
                network.
            </CreateProtocolConfirmation>
        </>
    )
}
