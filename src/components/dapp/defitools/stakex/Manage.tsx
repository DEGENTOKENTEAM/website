import {
    ManageStakeXContext,
    ManageStakeXContextDataType,
} from '@dapphelpers/defitools'
import { useGetStakingToken } from '@dapphooks/staking/useGetStakingToken'
import { avalanche } from '@wagmi/chains'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Address, zeroAddress } from 'viem'
import { Buckets } from './manage/Buckets'
import { Control } from './manage/Control'
import { Customization } from './manage/Customization'
import { Fees } from './manage/Fees'
import { GeneralInformation } from './manage/GeneralInformation'
import { PayoutTokens } from './manage/PayoutTokens'
import { RewardTokens } from './manage/RewardTokens'
import { useGetContractOwner } from '@dapphooks/staking/useGetContractOwner'
import { useAccount } from 'wagmi'
import _ from 'lodash'

export const Manage = () => {
    const { protocolAddress } = useParams<{ protocolAddress: Address }>()

    const navigate = useNavigate()
    const { address } = useAccount()

    if (!protocolAddress) {
        toast.error('Invalid protocol address')
        navigate('/dapp/defitools')
        return <></>
    }

    const [data, setData] = useState<ManageStakeXContextDataType>({
        protocol: protocolAddress,
        chain: avalanche,
        owner: zeroAddress,
        isOwner: false,
        isLoading: false,
    })

    const { data: dataStakingToken } = useGetStakingToken(protocolAddress)
    const { data: dataContractOwner } = useGetContractOwner(protocolAddress)

    useEffect(() => {
        if (!dataStakingToken) return

        let newData: ManageStakeXContextDataType = {
            ...data,
            stakingToken: dataStakingToken,
        }

        newData = { ...newData, isLoading: false }

        setData(newData)
    }, [dataStakingToken])

    useEffect(() => {
        if (!dataContractOwner) return

        setData({
            ...data,
            owner: dataContractOwner,
            isOwner: _.toLower(address) === _.toLower(dataContractOwner),
        })
    }, [address, dataContractOwner])

    return (
        protocolAddress && (
            <ManageStakeXContext.Provider value={{ data, setData }}>
                <div className="mb-8 flex flex-col gap-8">
                    <h1 className="flex w-full max-w-2xl flex-row items-end gap-1 px-8 font-title text-3xl font-bold tracking-wide sm:px-0">
                        <span className="text-techGreen">STAKE</span>
                        <span className="text-degenOrange">X</span>
                        <span className="text-xl">Management</span>
                    </h1>
                    <GeneralInformation protocolAddress={protocolAddress} />
                    <Customization />
                    <Buckets />
                    <RewardTokens />
                    <PayoutTokens />
                    <Fees />
                    {data.isOwner && <Control />}
                </div>
            </ManageStakeXContext.Provider>
        )
    )
}
