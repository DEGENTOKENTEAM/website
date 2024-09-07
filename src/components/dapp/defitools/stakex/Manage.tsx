import { ManageStakeXContext, ManageStakeXContextDataType } from '@dapphelpers/defitools'
import { useActive } from '@dapphooks/staking/useActive'
import { useGetContractOwner } from '@dapphooks/staking/useGetContractOwner'
import { useGetMetrics } from '@dapphooks/staking/useGetMetrics'
import { useGetStakingToken } from '@dapphooks/staking/useGetStakingToken'
import { useRunning } from '@dapphooks/staking/useRunning'
import { NotConnectedHint } from '@dappshared/NotConnectedHint'
import { WrongChainHint } from '@dappshared/WrongChainHint'
import _, { isUndefined } from 'lodash'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getChainById } from 'shared/supportedChains'
import { Address, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { Buckets } from './manage/Buckets'
import { Control } from './manage/Control'
import { Customization } from './manage/Customization'
import { Fees } from './manage/Fees'
import { GeneralInformation } from './manage/GeneralInformation'
import { InjectRewards } from './manage/InjectRewards'
import { NFTManagement } from './manage/NFTManagement'
import { StakingProgressChart } from './manage/StakingProgressChart'
import { TokenManagement } from './manage/TokenManagement'
import { Checklist } from './manage/Checklist'
import { UpdateAvailability } from './manage/UpdateAvailability'

export const Manage = () => {
    const { protocolAddress, chainId } = useParams<{
        protocolAddress: Address
        chainId: string
    }>()

    let protocolChainId = Number(chainId ?? 43114) // with Avalanche as fallback

    const navigate = useNavigate()
    const { address, isConnected, chain: chainAccount } = useAccount()

    const chain = getChainById(protocolChainId)
    const [data, setData] = useState<ManageStakeXContextDataType>({
        protocol: protocolAddress!,
        chain,
        owner: zeroAddress,
        isOwner: false,
        isActive: false,
        isRunning: false,
        isLoading: false,
    })

    const { data: dataStakingToken } = useGetStakingToken(protocolAddress!, chain?.id!)
    const { data: dataContractOwner } = useGetContractOwner(protocolAddress!, chain?.id!)
    const { response: dataMetrics } = useGetMetrics(protocolAddress!, chain?.id!)
    const { data: dataIsActive } = useActive(protocolAddress!, chain?.id!)
    const { data: dataIsRunning } = useRunning(protocolAddress!, chain?.id!)

    useEffect(() => {
        const _data: ManageStakeXContextDataType = {
            ...(data || {}),
            isLoading: !Boolean(dataStakingToken && dataMetrics && dataContractOwner),
        }

        if (dataContractOwner) {
            _data.owner = dataContractOwner
            _data.isOwner = Boolean(address && _.toLower(address) === _.toLower(dataContractOwner))
        }

        if (dataMetrics) _data.metrics = dataMetrics
        if (dataStakingToken) _data.stakingToken = dataStakingToken
        if (!isUndefined(dataIsActive)) _data.isActive = dataIsActive
        if (!isUndefined(dataIsRunning)) _data.isRunning = dataIsRunning

        setData(_data)
    }, [dataStakingToken, address, dataMetrics, dataContractOwner, dataIsActive, dataIsRunning])

    if (!protocolAddress) {
        toast.error('Invalid protocol address')
        navigate('/dapp/defitools')
        return <></>
    }

    const reloadData = () => {
        // TODO maybe do something to update protocol specific stuff
    }

    return (
        protocolAddress && (
            <ManageStakeXContext.Provider value={{ data, setData, reloadData }}>
                <div className="mb-8 flex w-full max-w-5xl flex-col gap-8">
                    <h1 className="flex w-full max-w-2xl flex-row items-end px-8 font-title text-3xl font-bold tracking-wide sm:px-0">
                        <span className="text-techGreen">STAKE</span>
                        <span className="text-degenOrange">X</span>
                        <span className="ml-1 text-xl">Management</span>
                    </h1>
                    {data.isOwner && <UpdateAvailability />}
                    {isConnected && chainAccount && chain && chain.id !== chainAccount.id && (
                        <WrongChainHint chainIdProtocol={chain.id} chainIdAccount={chainAccount.id!} />
                    )}
                    {!isConnected && <NotConnectedHint />}
                    <Checklist />
                    <Customization />
                    <GeneralInformation />
                    <StakingProgressChart />
                    <Buckets />
                    <TokenManagement />
                    <NFTManagement />
                    {data.isOwner && <Control />}
                    <Fees />
                    <InjectRewards />
                </div>
            </ManageStakeXContext.Provider>
        )
    )
}
