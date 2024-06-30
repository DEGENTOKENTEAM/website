import { Route, Routes } from 'react-router-dom'
import { Create } from './Create'
import { Manage } from './Manage'
import { Protocols } from './Protocols'
import { ToastContainer } from 'react-toastify'

export const Overview = () => {
    return (
        <>
            <Routes>
                <Route index element={<Protocols />} />
                <Route element={<Create />} path="create" />
                <Route element={<Manage />} path="manage/:protocolAddress" />
            </Routes>
            <ToastContainer />
        </>
    )
}
