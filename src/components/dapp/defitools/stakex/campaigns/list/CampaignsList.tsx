import { Spinner } from '@dappelements/Spinner'
import { DAppContext } from '@dapphelpers/dapp'
import { useGetCampaigns } from '@dapphooks/staking/useGetCampaigns'
import { useContext, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { CampaignResponse } from 'shared/types'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { CampaignProtocolTile } from './components/CampaignProtocolTile'

export const CampaignsList = () => {
    const { setTitle } = useContext(DAppContext)
    const [isLoading, setIsLoading] = useState(true)
    const location = useLocation()
    const { address } = useAccount()
    let { chainId: _chainId } = useParams()
    const chainId = Number(_chainId)

    const isMyCampaign = location.pathname.includes('/account')

    const [campaigns, setCampaigns] = useState<CampaignResponse[]>()
    const [allCampaigns, setAllCampaigns] = useState<CampaignResponse[]>()
    const { response: responseCampaigns, loading: loadingCampaigns } = useGetCampaigns({
        chainId,
        ...(isMyCampaign ? { account: address as Address } : {}),
    })

    useEffect(() => {
        if (!loadingCampaigns && responseCampaigns) {
            setAllCampaigns(
                responseCampaigns.map((campaign) => ({
                    ...campaign,
                    rewardAmount: BigInt(campaign.rewardAmount || 0n),
                    initialRewardAmount: BigInt(campaign.initialRewardAmount || 0n),
                }))
            )
        }
    }, [loadingCampaigns, responseCampaigns])

    useEffect(() => {
        if (allCampaigns) {
            setCampaigns(allCampaigns)
        } else setCampaigns([])
    }, [allCampaigns])

    useEffect(() => {
        if (campaigns) setIsLoading(false)
    }, [campaigns])

    useEffect(() => {
        setTitle && setTitle(`STAKEX - ${isMyCampaign ? 'My ' : ''}Time-Limited Campaign Staking`)
    }, [])

    return (
        <div className="mb-8 flex w-full max-w-5xl flex-col gap-8">
            <div className="flex flex-col gap-8 px-8 sm:flex-row sm:px-0">
                <h1 className="flex w-full flex-col items-start gap-1 font-title text-3xl font-bold tracking-wide sm:px-0 md:flex-row md:gap-4">
                    <span>
                        <span className="text-techGreen">STAKE</span>
                        <span className="text-degenOrange">X</span>
                    </span>
                    <span>{isMyCampaign && 'My '}Time-Limited Campaign Staking</span>
                </h1>
            </div>
            {isLoading && (
                <div className="flex w-full items-center justify-center">
                    <Spinner theme="dark" />
                </div>
            )}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {!isLoading &&
                    campaigns &&
                    campaigns.map((campaign) => (
                        <CampaignProtocolTile key={campaign.bucketId} campaignResponse={campaign} chainId={chainId} />
                    ))}
            </div>
        </div>
    )
}
