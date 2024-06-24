import { Route, Routes } from 'react-router-dom'
import { Create } from './Create'
import { Manage } from './Manage'
import { Protocols } from './Protocols'

export const Overview = () => {
    return (
        <div>
            IEK IEK STAKE X OVERVIEW
            <Routes>
                <Route index element={<Protocols />} />
                <Route element={<Create />} path="create" />
                <Route element={<Manage />} path="manage/:protocolAddress" />
            </Routes>
        </div>
    )
}
