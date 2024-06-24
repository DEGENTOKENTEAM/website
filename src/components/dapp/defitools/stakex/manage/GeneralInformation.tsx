import { Tile } from '@dappshared/Tile'
import { useParams } from 'react-router-dom'
import { Address } from 'viem'

type ManageBaseType = {
    protocolAddress: Address
}

export const GeneralInformation = ({ protocolAddress }: ManageBaseType) => {
    return (
        <Tile className="w-full max-w-2xl">
            <span className="flex-1 font-title text-xl font-bold">
                General Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 [&>*:nth-child(odd)]:mt-4 sm:[&>*:nth-child(odd)]:m-0">
                <div>Protocol address:</div>
                <div>{protocolAddress}</div>
            </div>

            <p>
                Deposit function Link (extra area which is also reachable from
                STAKEX protocol)
            </p>
            <p>is active</p>
            <p>is running</p>
            <p>Owner address</p>
            <p>Is initialized</p>
            <p>TVL (Token and Reward assets)</p>
            <p>
                If it's not started yet and no option set, provide start
                functions (Instant, By Block, By Time)
            </p>
        </Tile>
    )
}
