import {
    ManageStakeXContext,
    ManageStakeXContextDataType,
} from '@dapphelpers/defitools'
import { useGetContractOwner } from '@dapphooks/staking/useGetContractOwner'
import { useGetMetrics } from '@dapphooks/staking/useGetMetrics'
import { useGetStakingToken } from '@dapphooks/staking/useGetStakingToken'
import { Chain, avalanche } from '@wagmi/chains'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Address, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { Buckets } from './manage/Buckets'
import { Control } from './manage/Control'
import { Customization } from './manage/Customization'
import { Fees } from './manage/Fees'
import { GeneralInformation } from './manage/GeneralInformation'
import { InjectRewards } from './manage/InjectRewards'
import { PayoutTokens } from './manage/PayoutTokens'
import { RewardTokens } from './manage/RewardTokens'
import { StakingProgressChart } from './manage/StakingProgressChart'

export const Manage = () => {
    const { protocolAddress } = useParams<{ protocolAddress: Address }>()

    const navigate = useNavigate()
    const { address, chain: chainAccount } = useAccount()

    if (!protocolAddress) {
        toast.error('Invalid protocol address')
        navigate('/dapp/defitools')
        return <></>
    }

    const chain = (chainAccount ? chainAccount : avalanche) as Chain // TODO dynamic chain
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
            _data.isOwner = _.toLower(address) === _.toLower(dataContractOwner)
        }

        if (dataMetrics) _data.metrics = dataMetrics

        setData(_data)
    }, [dataStakingToken, dataMetrics, dataContractOwner])

    return (
        protocolAddress && (
            <ManageStakeXContext.Provider value={{ data, setData }}>
                <div className="mb-8 flex flex-col gap-8">
                    <h1 className="flex w-full max-w-2xl flex-row items-end gap-1 px-8 font-title text-3xl font-bold tracking-wide sm:px-0">
                        <span className="text-techGreen">STAKE</span>
                        <span className="text-degenOrange">X</span>
                        <span className="text-xl">Management</span>
                    </h1>
                    <Customization />
                    <GeneralInformation />
                    <StakingProgressChart />
                    <Buckets />
                    <RewardTokens />
                    <PayoutTokens />
                    <Fees />
                    {data.isOwner && <Control />}
                    <InjectRewards />
                </div>
            </ManageStakeXContext.Provider>
        )
    )
}
