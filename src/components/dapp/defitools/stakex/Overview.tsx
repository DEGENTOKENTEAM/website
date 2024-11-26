import { useEffect } from 'react'
import { Route, Routes, useSearchParams } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { useLocalStorage } from 'usehooks-ts'
import { Address, zeroAddress } from 'viem'
import { Create } from './Create'
import { Explanation } from './Explanation'
import { Manage } from './Manage'
import { Protocols } from './Protocols'
import { CampaignsDetails } from './campaigns/details/CampaignsDetails'
import { CampaignsList } from './campaigns/list/CampaignsList'

export const Overview = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [, saveStoredRef] = useLocalStorage<Address>('stakexRef', zeroAddress)
    useEffect(() => {
        if (searchParams && searchParams.has('ref') && saveStoredRef) {
            saveStoredRef(searchParams.get('ref') as Address)
            searchParams.delete('ref')
            setSearchParams(searchParams)
        }
    }, [searchParams, saveStoredRef])

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
