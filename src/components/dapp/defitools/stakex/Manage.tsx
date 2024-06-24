import { Customization } from './manage/Customization'
import { GeneralInformation } from './manage/GeneralInformation'
import { PayoutTokens } from './manage/PayoutTokens'
import { RewardTokens } from './manage/RewardTokens'
import { Fees } from './manage/Fees'
import { Control } from './manage/Control'
import { useNavigate, useParams } from 'react-router-dom'
import { Address } from 'viem'
import { toast } from 'react-toastify'

export const Manage = () => {
    const { protocolAddress } = useParams<{ protocolAddress: Address }>()
    const navigate = useNavigate()

    if (!protocolAddress) {
        toast.error('Invalid protocol address')
        navigate('/dapp/defitools')
        return <></>
    }

    return (
        protocolAddress && (
            <div className="flex flex-col gap-8">
                <h1 className="flex w-full max-w-2xl flex-row items-end gap-1 px-8 font-title text-3xl font-bold tracking-wide sm:px-0">
                    <span className="text-techGreen">STAKE</span>
                    <span className="text-degenOrange">X</span>
                    <span className="text-xl">Management</span>
                </h1>
                <GeneralInformation protocolAddress={protocolAddress} />
                <Customization />
                <PayoutTokens />
                <RewardTokens />
                <Fees />
                <Control />
            </div>
        )
    )
}
