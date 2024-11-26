import { Route, Routes } from 'react-router-dom'
import { Create } from './Create'
import { Manage } from './Manage'
import { Protocols } from './Protocols'
import { ToastContainer } from 'react-toastify'
import { Explanation } from './Explanation'
import { CampaignsList } from './campaigns/list/CampaignsList'
import { CampaignsDetails } from './campaigns/details/CampaignsDetails'

export const Overview = () => {
    return (
        <>
            <Routes>
                <Route index element={<Explanation />} />

                <Route element={<Protocols />} path="regulars/" />
                <Route element={<Protocols />} path="regulars/account/" />
                <Route element={<CampaignsList />} path="campaigns/" />
                <Route element={<CampaignsList />} path="campaigns/account/" />

                <Route element={<Create enableCampaignMode={false} />} path="regulars/create/" />
                <Route element={<Create enableCampaignMode={true} />} path="campaigns/create/" />

                <Route element={<Protocols />} path="regulars/:chainId/" />
                {/* <Route element={<CampaignsList />} path="campaigns/:chainId" /> */}

                <Route element={<Manage />} path="regulars/manage/:chainId/:protocolAddress/" />
                <Route element={<Manage />} path="campaigns/manage/:chainId/:protocolAddress/" />

                <Route element={<CampaignsDetails />} path="campaigns/details/:chainId/:protocolAddress/:campaignId/" />
            </Routes>
            <ToastContainer />
        </>
    )
}
