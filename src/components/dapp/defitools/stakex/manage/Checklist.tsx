import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useGetCustomization } from '@dapphooks/staking/useGetCustomization'
import { useNFTGetConfigs } from '@dapphooks/staking/useNFTGetConfigs'
import { Tile } from '@dappshared/Tile'
import clsx from 'clsx'
import { useContext, useEffect, useState } from 'react'
import { MdCheckBoxOutlineBlank, MdOutlineCheckBox } from 'react-icons/md'

export const Checklist = () => {
    const {
        data: { isActive, isOwner, protocol, chain },
    } = useContext(ManageStakeXContext)

    const [hasNFTConfiguration, setHasNFTConfiguration] = useState(false)
    const [hasLogo, setHasLogo] = useState(false)

    const { response } = useGetCustomization(protocol, chain?.id!)
    const { data: dataNFTConfigs } = useNFTGetConfigs(protocol, chain?.id!)

    useEffect(() => {
        setHasLogo(Boolean(response && response.data && response.data.logoUrl))
    }, [response])

    useEffect(() => {
        setHasNFTConfiguration(Boolean(dataNFTConfigs && dataNFTConfigs.length > 0))
    }, [dataNFTConfigs])

    return isOwner ? (
        <Tile>
            <div className="flex flex-col font-title text-lg font-bold">
                <span className="mb-4 flex-1 text-xl">Checklist</span>
                <div className={clsx(['flex flex-row items-start gap-2', hasLogo && 'text-dapp-cyan-500'])}>
                    {hasLogo ? (
                        <MdOutlineCheckBox className="mt-1 h-6 w-6" />
                    ) : (
                        <MdCheckBoxOutlineBlank className="mt-1 h-6 w-6" />
                    )}
                    <span className="flex-1 ">Step 1: Upload a custom logo</span>
                </div>
                <div className={clsx(['flex flex-row items-start gap-2', hasNFTConfiguration && 'text-dapp-cyan-500'])}>
                    {hasNFTConfiguration ? (
                        <MdOutlineCheckBox className="mt-1 h-6 w-6" />
                    ) : (
                        <MdCheckBoxOutlineBlank className="mt-1 h-6 w-6" />
                    )}
                    <span className="flex-1 font-title text-lg font-bold">Step 2: Choose an NFT template</span>
                </div>
                <div className={clsx(['flex flex-row items-start gap-2', isActive && 'text-dapp-cyan-500'])}>
                    {isActive ? (
                        <MdOutlineCheckBox className="mt-1 h-6 w-6" />
                    ) : (
                        <MdCheckBoxOutlineBlank className="mt-1 h-6 w-6" />
                    )}
                    <span className="flex-1 font-title text-lg font-bold">Step 3: Enable your protocol</span>
                </div>
            </div>
        </Tile>
    ) : (
        <></>
    )
}
