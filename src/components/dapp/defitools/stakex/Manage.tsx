import {
    ManageStakeXContext,
    ManageStakeXContextDataType,
} from '@dapphelpers/defitools'
import { useGetContractOwner } from '@dapphooks/staking/useGetContractOwner'
import { useGetMetrics } from '@dapphooks/staking/useGetMetrics'
import { useGetStakingToken } from '@dapphooks/staking/useGetStakingToken'
import { NotConnectedHint } from '@dappshared/NotConnectedHint'
import { WrongChainHint } from '@dappshared/WrongChainHint'
import _ from 'lodash'
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
import { StakingProgressChart } from './manage/StakingProgressChart'
import { TokenManagement } from './manage/TokenManagement'

export const Manage = () => {
    const { protocolAddress, chainId } = useParams<{
        protocolAddress: Address
        chainId: string
    }>()

    let protocolChainId = Number(chainId ?? 43114) // with Avalanche as fallback

    const navigate = useNavigate()
    const { address, isConnected } = useAccount()

    if (!protocolAddress) {
        toast.error('Invalid protocol address')
        navigate('/dapp/defitools')
        return <></>
    }

    const chain = getChainById(protocolChainId)
    const [data, setData] = useState<ManageStakeXContextDataType>({
        protocol: protocolAddress,
        chain,
        owner: zeroAddress,
        isOwner: false,
        isLoading: false,
    })

    const { data: dataStakingToken } = useGetStakingToken(protocolAddress)
    const { data: dataContractOwner } = useGetContractOwner(protocolAddress)
    const { response: dataMetrics } = useGetMetrics({
        chainId: chain.id,
        protocol: protocolAddress,
    })

    useEffect(() => {
        const _data: ManageStakeXContextDataType = {
            ...data,
            isLoading: !Boolean(
                dataStakingToken && dataMetrics && dataContractOwner
            ),
        }

        if (dataStakingToken) _data.stakingToken = dataStakingToken

        if (dataContractOwner) {
            _data.owner = dataContractOwner
            _data.isOwner = Boolean(
                address && _.toLower(address) === _.toLower(dataContractOwner)
            )
        }

        if (dataMetrics) _data.metrics = dataMetrics

        setData(_data)
    }, [dataStakingToken, address, dataMetrics, dataContractOwner])

    return (
        protocolAddress && (
            <ManageStakeXContext.Provider value={{ data, setData }}>
                <div className="mb-8 flex w-full max-w-5xl flex-col gap-8">
                    <h1 className="flex w-full max-w-2xl flex-row items-end gap-1 px-8 font-title text-3xl font-bold tracking-wide sm:px-0">
                        <span className="text-techGreen">STAKE</span>
                        <span className="text-degenOrange">X</span>
                        <span className="text-xl">Management</span>
                    </h1>
                    {isConnected && <WrongChainHint chainId={chain.id} />}
                    {!isConnected && <NotConnectedHint />}
                    <Customization />
                    <GeneralInformation />
                    <StakingProgressChart />
                    <Buckets />
                    <TokenManagement />
                    {/* <RewardTokens /> */}
                    <Fees />
                    {data.isOwner && <Control />}
                    <InjectRewards />
                </div>
            </ManageStakeXContext.Provider>
        )
    )
}
