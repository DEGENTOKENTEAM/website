import { Tile } from '@dappshared/Tile'
import { useNavigation, useParams } from 'react-router-dom'

export const Customization = () => {
  const { protocolAddress } = useParams()
  console.log({protocolAddress})

    return (
        <Tile className="w-full max-w-2xl">
            <span className="flex-1 font-title text-xl font-bold">
                UI & Customization
            </span>
        </Tile>
    )
}
