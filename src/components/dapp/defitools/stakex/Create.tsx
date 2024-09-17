import { Spinner } from '@dappelements/Spinner'
import { DAppContext } from '@dapphelpers/dapp'
import { toReadableNumber } from '@dapphelpers/number'
import { useDeployProtocolSTAKEX } from '@dapphooks/deployer/useDeployProtocolSTAKEX'
import { useGetFeeEstimationDeployerSTAKEX } from '@dapphooks/deployer/useGetFeeEstimationDeployerSTAKEX'
import { useGetNetworkFeeEstimationDeployerSTAKEX } from '@dapphooks/deployer/useGetNetworkFeeEstimationDeployerSTAKEX'
import { useGetReferrerById } from '@dapphooks/deployer/useGetReferrerById'
import { useGetTokenInfo } from '@dapphooks/shared/useGetTokenInfo'
import { CaretDivider } from '@dappshared/CaretDivider'
import { NetworkSelectorForm } from '@dappshared/NetworkSelectorForm'
import { SwitchForm } from '@dappshared/SwitchForm'
import { Tile } from '@dappshared/Tile'
import { TokenSearchInput } from '@dappshared/TokenSearchInput'
import { STAKEXCreatorData, STAKEXCreatorDataInitParams, STAKEXDeployArgs } from '@dapptypes'
import { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getChainById } from 'shared/supportedChains'
import { Button } from 'src/components/Button'
import { useLocalStorage } from 'usehooks-ts'
import { Address, Chain, encodeFunctionData, parseAbi, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import protocols from './../../../../../config/protocols'
import { CreateProtocolConfirmation } from './create/overlays/CreateProtocolConfirmation'
import { BucketFormParams } from './manage/buckets/Form'
import { LockUnits, LockUnitsForm } from './manage/buckets/LockUnitsForm'

const initParams: STAKEXCreatorDataInitParams = {
    stakingToken: null,
    bucketsToAdd: null,
    rewards: null,
    manager: null,
    swaps: [],
    stableToken: zeroAddress,
    excludeStakingTokenFromRewards: false,
}
const initDeployArgs: STAKEXDeployArgs = {
    referral: zeroAddress,
    initContract: zeroAddress,
    initFn: '',
    initParams,
}

const initStorageData: STAKEXCreatorData = {
    chainId: 0,
    deployArgs: initDeployArgs,
}

const initBucketData: BucketFormParams = {
    burn: false,
    initialShare: 10000,
    shareLock: true,
    lockUnit: 'month',
    lockPeriod: 1,
    shareMax: 5000,
    lock: false,
    share: 10000,
}

export const Create = () => {
    const { setTitle } = useContext(DAppContext)
    const navigate = useNavigate()
    const { isConnected, chainId, address: addressConnected } = useAccount()
    const [searchParams] = useSearchParams()
    const [storedRef, saveStoredRef] = useLocalStorage<Address>('stakexRef', zeroAddress)
    const chainIds = Object.keys(protocols).map((v) => +v)
    const networks = chainIds.map((id) => getChainById(id))

    const [data, setData] = useState<STAKEXCreatorData>(initStorageData)
    const [isLoading, setIsLoading] = useState(true)
    const [isValid, setIsValid] = useState(false)
    const [selectedChain, setSelectedChain] = useState<Chain>()
    const [deployerAddress, setDeployerAddress] = useState<Address>()
    const [deployFee, setDeployFee] = useState<bigint>()
    const [networkFee, setNetworkFee] = useState<bigint>()
    const [totalFeeEstimation, setTotalFeeEstimation] = useState<bigint>()
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)

    // staking token selection
    const [stakingTokenAddress, setStakingTokenAddress] = useState<Address | null>(null)
    const [isStakingTokenSearchActive, setIsStakingTokenSearchActive] = useState(false)
    const [useDifferentRewardToken, setUseDifferentRewardToken] = useState(true)

    // reward token selection
    const [rewardTokenAddress, setRewardTokenAddress] = useState<Address | null>(null)
    const [isRewardTokenSearchActive, setIsRewardTokenSearchActive] = useState(false)

    // stake lock
    const [enableStakeLock, setEnableStakeLock] = useState(true)
    const [bucketFormData, setBucketFormData] = useState<BucketFormParams>(initBucketData)

    // deployment parameter
    const [deploymentParams, setDeploymentParams] = useState<STAKEXDeployArgs | null>(null)

    const {
        error: errorStakingTokenInfo,
        isLoading: isLoadingStakingTokenInfo,
        data: dataStakingTokenInfo,
        refetch: refetchStakingTokenInfo,
    } = useGetTokenInfo({
        enabled: Boolean(selectedChain && selectedChain.id && stakingTokenAddress),
        token: stakingTokenAddress!,
        chainId: selectedChain?.id!,
    })

    const {
        error: errorRewardTokenInfo,
        isLoading: isLoadingRewardTokenInfo,
        data: dataRewardTokenInfo,
        refetch: refetchRewardTokenInfo,
    } = useGetTokenInfo({
        enabled: Boolean(selectedChain && selectedChain.id && rewardTokenAddress),
        token: rewardTokenAddress!,
        chainId: selectedChain?.id!,
    })
    const { data: dataFeeEstimation, refetch: refetchFeeEstimation } = useGetFeeEstimationDeployerSTAKEX(
        deployerAddress!,
        selectedChain?.id!
    )

    const { data: dataNetworkFeeEstimation } = useGetNetworkFeeEstimationDeployerSTAKEX(
        deployerAddress!,
        selectedChain?.id!,
        dataFeeEstimation!,
        deploymentParams
    )
    const {
        write: writeDeployProtocol,
        reset: resetDeployProtocol,
        isLoading: isLoadingDeployProtocol,
        isPending: isPendingDeployProtocol,
        error: errorDeployProtocol,
        isSuccess: isSuccessDeployProtocol,
        deployedProtocol,
    } = useDeployProtocolSTAKEX(
        deployerAddress!,
        selectedChain?.id!,
        deployFee!,
        deploymentParams!,
        isValid && isConnected
    )
    const { data: dataReferrer } = useGetReferrerById(deployerAddress!, selectedChain?.id!, storedRef!)

    const onChangeSelectedNetwork = (chain: Chain) => {
        if (!selectedChain || chain.id !== selectedChain?.id) setSelectedChain(chain)
    }

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

    // lock option
    const onChangeLockPeriod = (_event: ChangeEvent<HTMLInputElement>, _: number) => {
        setBucketFormData({ ...bucketFormData, lockPeriod: Number(_event.target.value) })
    }

    const onChangeLockUnit = (_: number, lockUnit: keyof typeof LockUnits) => {
        setBucketFormData({ ...bucketFormData, lockUnit })
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

    // TODO respect discounts and show in UI

    useEffect(() => {
        const _chainId = Number(chainId || process.env.NEXT_PUBLIC_CHAIN_ID)
        const _chain = networks.find((chain) => chain.id === _chainId)
        if (_chain && (!selectedChain || selectedChain?.id != _chain.id)) setSelectedChain(_chain)
        setIsLoading(false)
    }, [chainId])

    useEffect(() => {
        if (!selectedChain || !protocols) return

        setData({
            chainId: selectedChain.id,
            deployArgs: {
                referral: dataReferrer && dataReferrer.active ? dataReferrer.account : zeroAddress,
                initContract: protocols[selectedChain.id].stakex.init,
                initFn: encodeFunctionData({
                    abi: parseAbi(['function init(address)']),
                    functionName: 'init',
                    args: [protocols[selectedChain.id].deployer],
                }),
                initParams: {
                    ...initParams,
                    rewards:
                        useDifferentRewardToken && dataRewardTokenInfo && dataRewardTokenInfo.symbol
                            ? [{ token: dataRewardTokenInfo.source }]
                            : [],
                    stakingToken:
                        dataStakingTokenInfo && dataStakingTokenInfo.symbol ? dataStakingTokenInfo.source : null,
                    bucketsToAdd: bucketFormData
                        ? [
                              {
                                  burn: bucketFormData.burn,
                                  lock: bucketFormData.lock
                                      ? LockUnits[bucketFormData.lockUnit] * bucketFormData.lockPeriod
                                      : 0,
                                  share: bucketFormData.share,
                              },
                          ]
                        : null,
                    manager: addressConnected ? addressConnected : null,
                    excludeStakingTokenFromRewards: useDifferentRewardToken,
                },
            },
        })
    }, [
        selectedChain,
        dataReferrer,
        bucketFormData,
        dataStakingTokenInfo,
        dataRewardTokenInfo,
        addressConnected,
        useDifferentRewardToken,
    ])

    useEffect(() => {
        if (!data) return

        const { deployArgs } = data

        const _valid = Boolean(
            deployArgs.referral &&
                deployArgs.initContract &&
                deployArgs.initFn &&
                deployArgs.initParams.bucketsToAdd &&
                deployArgs.initParams.manager &&
                deployArgs.initParams.stableToken &&
                deployArgs.initParams.stakingToken &&
                deployArgs.initParams.swaps &&
                deployArgs.initParams.rewards &&
                ((deployArgs.initParams.excludeStakingTokenFromRewards === true &&
                    deployArgs.initParams.rewards.length === 1) ||
                    (deployArgs.initParams.excludeStakingTokenFromRewards === false &&
                        deployArgs.initParams.rewards.length === 0))
        )

        setIsValid(_valid)
        setDeploymentParams(_valid ? deployArgs : initDeployArgs)
    }, [data])

    useEffect(() => {
        setDeployFee(dataFeeEstimation ? dataFeeEstimation : 0n)
        setNetworkFee(dataNetworkFeeEstimation ? dataNetworkFeeEstimation : 0n)
        setTotalFeeEstimation(
            dataFeeEstimation && dataNetworkFeeEstimation ? dataFeeEstimation + dataNetworkFeeEstimation : 0n
        )
    }, [dataFeeEstimation, dataNetworkFeeEstimation])

    useEffect(() => {
        if (!useDifferentRewardToken) setRewardTokenAddress(null)
    }, [useDifferentRewardToken])

    useEffect(() => {
        if (!enableStakeLock) setBucketFormData(initBucketData)
    }, [enableStakeLock])

    useEffect(() => {
        refetchFeeEstimation && refetchFeeEstimation()
        setNetworkFee(undefined)
        setTotalFeeEstimation(undefined)
    }, [selectedChain, refetchFeeEstimation])

    useEffect(() => {
        setDeployerAddress(selectedChain ? protocols[selectedChain.id].deployer : undefined)
    }, [selectedChain, refetchRewardTokenInfo, refetchStakingTokenInfo])

    useEffect(() => {
        const ref = searchParams.get('ref') as Address
        saveStoredRef(ref)
        searchParams.delete('ref')
    }, [searchParams])

    useEffect(() => {
        setTitle('STAKEX Creator')
    })

    return (
        <>
            <div className="mb-8 flex w-full max-w-5xl flex-col gap-8">
                <h1 className="flex w-full max-w-2xl flex-row items-end px-8 font-title text-3xl font-bold tracking-wide sm:px-0">
                    <span className="text-techGreen">STAKE</span>
                    <span className="text-degenOrange">X</span>
                    <span className="ml-1 text-xl">Creator</span>
                </h1>
                {!isLoading && (
                    <Tile className="flex flex-col gap-8">
                        <div className="flex flex-col gap-4">
                            <span className="text-lg font-bold">Choose network</span>
                            {selectedChain && (
                                <NetworkSelectorForm
                                    chains={networks}
                                    selectedChain={selectedChain}
                                    onChange={onChangeSelectedNetwork}
                                />
                            )}
                        </div>

                        <div className="flex flex-col">
                            <div className="flex flex-1 flex-col">
                                <span className="text-lg font-bold">Enter Staking Token Address</span>
                                <span className="text-xs">
                                    Please insert the address of the ERC20 token that your stakers need to deposit to
                                    the protocol in order to stake.
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

                        <div className="flex flex-row gap-4">
                            <div className="flex flex-1 flex-col">
                                <span className="text-lg font-bold">Use different reward token</span>
                                <span className="text-xs">
                                    If you want to reward the same token that will be used for staking, you can disable
                                    this option.
                                </span>
                            </div>
                            <span>
                                <SwitchForm enabled={useDifferentRewardToken} onChange={setUseDifferentRewardToken} />
                            </span>
                        </div>

                        {useDifferentRewardToken && (
                            <div className="flex flex-col">
                                <div className="flex flex-1 flex-col">
                                    <span className="text-lg font-bold">Enter Reward Token Address</span>
                                    <span className="text-xs">
                                        Please insert the address of the ERC20 token that you want to reward to your
                                        stakers.
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
                        )}

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-row">
                                <div className="flex flex-1 flex-col">
                                    <span className="text-lg font-bold">Enable stake lock</span>
                                    <span className="text-xs">
                                        Set a period of time for a staker to lock up staked tokens. A staker can
                                        withdraw the staked tokens after this period. This setting only effects the
                                        withdrawal ability. A staker still receives rewards after the lock is lifted.
                                    </span>
                                </div>
                                <span>
                                    <SwitchForm enabled={enableStakeLock} onChange={setEnableStakeLock} />
                                </span>
                            </div>
                            {enableStakeLock && (
                                <div className="flex flex-col">
                                    <LockUnitsForm
                                        bucket={bucketFormData}
                                        bucketIndex={0}
                                        disabled={false}
                                        onChangeLockPeriod={onChangeLockPeriod}
                                        onChangeLockUnit={onChangeLockUnit}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <span className="text-lg font-bold">
                                What happens after creating my <span className="text-techGreen">STAKE</span>
                                <span className="text-degenOrange">X</span> staking protocol?
                            </span>
                            <p className="mt-4 text-base">
                                You&apos;ll be directed to the{' '}
                                <span className="font-bold">
                                    <span className="text-techGreen">STAKE</span>
                                    <span className="text-degenOrange">X</span>
                                    <span className="ml-1 text-dapp-cyan-50">Management</span>
                                </span>{' '}
                                area where you can configure your protocol in more detail and make further adjustments
                                if necessary:
                            </p>
                            <ul className="ml-6 list-outside list-disc">
                                <li>Upload a logo for your protocol</li>
                                <li>
                                    Configure protocol fees for depositing stakes, restaking rewards,and withdrawing
                                    stakes
                                </li>
                                <li>Add additional staking pools and lock periods</li>
                                <li>Add more staking reward tokens to inject</li>
                                <li>Provide multiple payout tokens to claim the rewards in</li>
                            </ul>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-lg font-bold">
                                <span className="text-techGreen">STAKE</span>
                                <span className="text-degenOrange">X</span> pricing
                            </span>
                            {selectedChain && (
                                <div className="mt-4 rounded-lg bg-dapp-blue-800 p-4">
                                    <div className="grid grid-cols-5 gap-1">
                                        <div className="col-span-5 text-right font-bold">
                                            {selectedChain.nativeCurrency.symbol}
                                        </div>
                                        <div className="col-span-5">
                                            <CaretDivider />
                                        </div>

                                        <div className="col-span-4">Protocol</div>
                                        <div className="flex justify-end">
                                            {!deployFee ? (
                                                <Spinner theme="dark" />
                                            ) : (
                                                toReadableNumber(deployFee, selectedChain.nativeCurrency.decimals)
                                            )}
                                        </div>

                                        <div className="col-span-4">Estimated network fee for deployment</div>
                                        <div className="flex justify-end">
                                            {isValid ? (
                                                !networkFee ? (
                                                    <Spinner theme="dark" />
                                                ) : (
                                                    `~${toReadableNumber(
                                                        networkFee,
                                                        selectedChain.nativeCurrency.decimals
                                                    )}`
                                                )
                                            ) : (
                                                <span>--</span>
                                            )}
                                        </div>

                                        <div className="col-span-5">
                                            <CaretDivider />
                                        </div>

                                        <div className="col-span-4">Estimated total costs</div>
                                        <div className="flex justify-end">
                                            {isValid ? (
                                                !totalFeeEstimation ? (
                                                    <Spinner theme="dark" />
                                                ) : (
                                                    `~${toReadableNumber(
                                                        totalFeeEstimation,
                                                        selectedChain.nativeCurrency.decimals
                                                    )}`
                                                )
                                            ) : (
                                                <span>--</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isConnected ? (
                            <Button
                                disabled={!isValid}
                                onClick={onClickCreate}
                                variant="primary"
                                className="h-20 text-xl"
                            >
                                Create my protocol
                            </Button>
                        ) : (
                            <Button variant="primary">Connect wallet</Button>
                        )}
                    </Tile>
                )}
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
                With this action, you will deploy your STAKEX staking protocol to the {selectedChain?.name} network.{' '}
                <br />
                <br />
                An estimated total of ~{toReadableNumber(
                    totalFeeEstimation,
                    selectedChain?.nativeCurrency.decimals
                )}{' '}
                {selectedChain?.nativeCurrency.symbol} will be charged for this.
            </CreateProtocolConfirmation>
        </>
    )
}
