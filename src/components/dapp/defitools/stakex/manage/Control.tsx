import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useActive } from '@dapphooks/staking/useActive'
import { Tile } from '@dappshared/Tile'
import { useContext } from 'react'
import { Button } from 'src/components/Button'

export const Control = () => {
    const {
        data: { protocol },
    } = useContext(ManageStakeXContext)

    const { data: dataIsActive } = useActive(protocol)

    return (
        <Tile className="w-full">
            <div className="flex flex-row items-center">
                <span className="flex-1 font-title text-xl font-bold">
                    Control
                </span>
            </div>
            <div className="mt-8 flex gap-4">
                {dataIsActive ? (
                    <Button variant="error">Disable Protocol</Button>
                ) : (
                    <Button variant="primary">Enable Protocol</Button>
                )}
            </div>
        </Tile>
    )
}
