import abi from '@dappabis/stakex/abi-ui.json'
import { Spinner } from '@dappelements/Spinner'
import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useNFTAddConfig } from '@dapphooks/staking/useNFTAddConfig'
import { useNFTGetConfigs } from '@dapphooks/staking/useNFTGetConfigs'
import { Tile } from '@dappshared/Tile'
import Image from 'next/image'
import { useContext, useEffect, useState } from 'react'
import { Button } from 'src/components/Button'
import { usePublicClient } from 'wagmi'
import previewImage from '../../../../../../public/stakex/nft.default.preview.svg'
import { AddFirstConfigConfirmation } from './nft/overlays/AddFirstConfigConfirmation'

export const NFTManagement = () => {
    const {
        data: { protocol, chain, isOwner },
    } = useContext(ManageStakeXContext)

    const client = usePublicClient({ chainId: chain?.id })

    const [hasConfigs, setHasConfigs] = useState(false)
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
    const [nftConfig, setNftConfig] = useState<any>(null)
    const [renderedNFTs, setRenderedNTFs] = useState<any>(null)

    const { data: dataNFTConfigs, refetch: refetchNFTConfigs } = useNFTGetConfigs(protocol, chain?.id!)
    const {
        error: errorAddNFTConfig,
        isLoading: isLoadingAddNFTConfig,
        isPending: isPendingAddNFTConfig,
        isSuccess: isSuccessAddNFTConfig,
        reset: resetAddNFTConfig,
        write: writeAddNFTConfig,
    } = useNFTAddConfig(protocol, chain?.id!, nftConfig)

    const onClickChooseRecommendedTemplate = async () => {
        setNftConfig((await import('../../../../../../public/stakex/nft.default.json')).default)
        setIsConfirmationModalOpen(true)
    }

    const onConfirmationModalOK = () => {
        writeAddNFTConfig && writeAddNFTConfig()
    }
    const onConfirmationModalNOK = () => {
        setIsConfirmationModalOpen(false)
    }
    const onConfirmationModalClose = () => {
        resetAddNFTConfig()
        refetchNFTConfigs && refetchNFTConfigs()
        setIsConfirmationModalOpen(false)
    }

    useEffect(() => {
        if (Boolean(protocol && dataNFTConfigs && dataNFTConfigs.length)) {
            setHasConfigs(true)
            if (client) {
                const reqs: Promise<any>[] = []
                dataNFTConfigs?.forEach((config) => {
                    reqs.push(
                        client.readContract({
                            address: protocol,
                            abi,
                            functionName: 'renderByConfig',
                            args: [config],
                        })
                    )
                })

                Promise.all(reqs).then((configs) => setRenderedNTFs(configs))
            }
        }
    }, [dataNFTConfigs, client, protocol])

    return (
        <>
            <Tile className="flex w-full flex-col gap-6">
                <div className="flex flex-row items-center">
                    <span className="flex-1 font-title text-xl font-bold">
                        {isOwner ? `NFT Management` : `Available NFTs`}
                    </span>
                </div>
                {hasConfigs &&
                    (renderedNFTs ? (
                        <div className="grid grid-cols-3 gap-6">
                            {renderedNFTs.map((nft: string, i: number) => (
                                <img key={i} alt={`NFT`} src={nft} className="rounded-xl shadow-lg" />
                            ))}
                        </div>
                    ) : (
                        <Spinner theme="dark" />
                    ))}
                {!hasConfigs &&
                    (!isOwner ? (
                        <div>
                            This protocol is being configured. Once there is an NFT configured, you will see it here!
                        </div>
                    ) : (
                        <>
                            <div>
                                Stakers will receive an NFT for each of their stake. In order to start with the staking,
                                you need to choose an NFT template. It will be a basic NFT setup for your staking
                                solution. A configured NFT is required in order to enable your staking protocol.
                                <br />
                                <br />
                                Soon there will be other templates to choose from. For now please choose the following
                                template:
                            </div>
                            <div className="flex">
                                <div className="relative w-1/3 overflow-auto rounded-xl">
                                    <Image src={previewImage} alt="Proposed NFT Image" />
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-dapp-cyan-50/30  hover:bg-dapp-cyan-50/70">
                                        <Button
                                            onClick={() => onClickChooseRecommendedTemplate()}
                                            variant="primary"
                                            className="pointer-events-auto !opacity-80 hover:!opacity-100"
                                        >
                                            Choose template
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ))}
            </Tile>
            <AddFirstConfigConfirmation
                isLoading={isLoadingAddNFTConfig}
                isSuccess={isSuccessAddNFTConfig}
                isPending={isPendingAddNFTConfig}
                isOpen={isConfirmationModalOpen}
                onConfirm={() => onConfirmationModalOK()}
                onCancel={() => onConfirmationModalNOK()}
                onClose={() => onConfirmationModalClose()}
                error={errorAddNFTConfig}
            />
        </>
    )
}
