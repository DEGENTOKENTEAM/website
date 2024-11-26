import { Spinner } from '@dappelements/Spinner'
import {
    ManageStakeXContext,
    ManageStakeXContextDataType,
    ManageStakeXContextInitialData,
} from '@dapphelpers/defitools'
import { useActive } from '@dapphooks/staking/useActive'
import { useCampaignIsCampaignMode } from '@dapphooks/staking/useCampaignIsCampaignMode'
import { useGetContractOwner } from '@dapphooks/staking/useGetContractOwner'
import { useGetMetrics } from '@dapphooks/staking/useGetMetrics'
import { useGetStakingToken } from '@dapphooks/staking/useGetStakingToken'
import { useRunning } from '@dapphooks/staking/useRunning'
import { NotConnectedHint } from '@dappshared/NotConnectedHint'
import { WrongChainHint } from '@dappshared/WrongChainHint'
import { isUndefined, toLower } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getChainById } from 'shared/supportedChains'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { CampaignsManage } from './campaigns/manage/CampaignsManage'
import { AddingUpManagement } from './manage/AddingUpManagement'
import { Buckets } from './manage/Buckets'
import { Control } from './manage/Control'
import { Fees } from './manage/Fees'
import { GeneralInformation } from './manage/GeneralInformation'
import { InjectRewards } from './manage/InjectRewards'
import { MergingManagement } from './manage/MergingManagement'
import { StakingProgressChart } from './manage/StakingProgressChart'
import { TokenManagement } from './manage/TokenManagement'
import { UpstakingManagement } from './manage/UpstakingManagement'

export const Manage = () => {
    const { protocolAddress, chainId } = useParams<{
        protocolAddress: Address
        chainId: string
    }>()

    let protocolChainId = Number(chainId ?? 43114) // with Avalanche as fallback

    const navigate = useNavigate()
    const { address, isConnected, chain: chainAccount } = useAccount()

    const chain = getChainById(protocolChainId)
    const [data, setData] = useState<ManageStakeXContextDataType>({ ...ManageStakeXContextInitialData, chain })

    const { data: dataStakingToken, refetch: refetchStakingToken } = useGetStakingToken(protocolAddress!, chain.id!)
    const { data: dataContractOwner } = useGetContractOwner(protocolAddress!, chain.id!)
    const { response: dataMetrics } = useGetMetrics(protocolAddress!, chain.id!)
    const { data: dataIsActive, refetch: refetchIsActive } = useActive(protocolAddress!, chain.id!)
    const { data: dataIsRunning, refetch: refetchIsRunning } = useRunning(protocolAddress!, chain.id!)
    const { data: dataIsCampaignMode, isLoading: isLoadingIsCampaignMode } = useCampaignIsCampaignMode(
        protocolAddress!,
        chain.id!
    )

    useEffect(() => {
        const _data: ManageStakeXContextDataType = {
            ...(ManageStakeXContextInitialData || {}),
            isLoading: !Boolean(dataStakingToken && dataMetrics && dataContractOwner),
        }

        _data.isOwner = Boolean(address && dataContractOwner && toLower(address) === toLower(dataContractOwner))
        _data.canEdit = Boolean(chain && chainAccount && chain.id === chainAccount.id && _data.isOwner)

        if (protocolAddress) _data.protocol = protocolAddress
        if (chain) _data.chain = chain
        if (dataContractOwner) _data.owner = dataContractOwner
        if (dataMetrics) _data.metrics = dataMetrics
        if (dataStakingToken) _data.stakingToken = dataStakingToken
        if (!isUndefined(dataIsActive)) _data.isActive = dataIsActive
        if (!isUndefined(dataIsRunning)) _data.isRunning = dataIsRunning
        if (!isUndefined(dataIsCampaignMode)) _data.isCampaign = dataIsCampaignMode

        setData(_data)
    }, [
        dataStakingToken,
        address,
        dataMetrics,
        dataContractOwner,
        dataIsActive,
        dataIsRunning,
        chain,
        chainAccount,
        protocolAddress,
        dataIsCampaignMode,
    ])

    const reloadData = useCallback(() => {
        refetchStakingToken && refetchStakingToken()
        refetchIsActive && refetchIsActive()
        refetchIsRunning && refetchIsRunning()
    }, [refetchStakingToken, refetchIsActive, refetchIsRunning])

    if (!protocolAddress) {
        toast.error('Invalid protocol address')
        navigate('/dapp/defitools')
        return <></>
    }

    return (
        protocolAddress && (
            <ManageStakeXContext.Provider value={{ data, setData, reloadData }}>
                <h1 className="my-2 flex w-full flex-row flex-wrap items-end gap-0 px-4 font-title text-3xl font-bold tracking-wide sm:px-0 md:gap-1">
                    <span>
                        <span className="text-techGreen">STAKE</span>
                        <span className="text-degenOrange">X</span>
                    </span>
                    <span className="text-xl">{dataIsCampaignMode && 'Campaign '}Management</span>
                </h1>
                <div className="mb-8 flex w-full max-w-5xl flex-col gap-8">
                    {isConnected && chainAccount && chain && chain.id !== chainAccount.id && (
                        <WrongChainHint chainIdProtocol={chain.id} chainIdAccount={chainAccount.id!} />
                    )}
                    {!isConnected && <NotConnectedHint />}

                    {isLoadingIsCampaignMode ? (
                        <div className="flex flex-col items-center justify-center gap-4 p-10">
                            <Spinner className="!h-10 !w-10" theme="dark" />
                            <span className="text-darkTextLowEmphasis">Loading...</span>
                        </div>
                    ) : dataIsCampaignMode ? (
                        <>
                            <GeneralInformation />
                            <CampaignsManage />
                        </>
                    ) : (
                        <>
                            <GeneralInformation />
                            <StakingProgressChart />
                            <Buckets />
                            <TokenManagement />
                            {/* <NFTManagement /> */}
                            {data.isOwner && <Control />}
                            <Fees />
                            <div className="grid gap-8 sm:grid-cols-2">
                                <UpstakingManagement />
                                <MergingManagement />
                            </div>
                            <div className="grid gap-8 sm:grid-cols-2">
                                <AddingUpManagement />
                                <InjectRewards />
                            </div>
                        </>
                    )}
                </div>
            </ManageStakeXContext.Provider>
        )
    )
}
