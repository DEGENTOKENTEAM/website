import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useGetCustomization } from '@dapphooks/staking/useGetCustomization'
import { useUpdateCustomization } from '@dapphooks/staking/useUpdateCustomization'
import { Tile } from '@dappshared/Tile'
import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react'
import { CircleStencil, Cropper, CropperRef } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import { toast } from 'react-toastify'
import { Button } from 'src/components/Button'
import { Spinner } from 'src/components/dapp/elements/Spinner'
import { StakingProjectLogo } from 'src/components/dapp/staking/StakingProjectLogo'
import { createSiweMessage, generateSiweNonce } from 'viem/siwe'
import { useAccount, useSignMessage } from 'wagmi'

export const Customization = () => {
    const {
        data: { protocol, owner, isOwner, chain },
    } = useContext(ManageStakeXContext)

    const { address, chainId } = useAccount()

    const inputFile = useRef<HTMLInputElement | null>(null)
    const cropperRef = useRef<CropperRef>(null)

    const [cropImage, setCropImage] = useState<string | null>(null)
    const [baseImage, setBaseImage] = useState('')
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [challengeMessage, setChallengeMessage] = useState<string | null>(
        null
    )

    const [isLoadingLogoUpload, setIsLoadingLogoUpload] = useState(false)

    const { response, load } = useGetCustomization(protocol)
    const {
        loading: loadingUpdate,
        response: responseUpdate,
        update,
    } = useUpdateCustomization()
    const {
        signMessage,
        data: signature,
        isPending: isPendingSignMessage,
        isSuccess: isSuccessSignMessage,
        reset: resetSignMessage,
    } = useSignMessage()

    const onClickUploadLogo = () => {
        inputFile && inputFile.current && inputFile.current?.click()
    }

    const onChangeFileInput = (_event: ChangeEvent<HTMLInputElement>) => {
        if (!_event.target.files || !_event.target.files?.length) return
        setCropImage(URL.createObjectURL(_event.target.files[0]))
    }

    const onClickPreview = () => {
        setPreviewImage(cropperRef.current?.getCanvas()?.toDataURL()!)
    }

    const onClickUpload = () => {
        if (!address || !chainId) return

        setIsLoadingLogoUpload(true)

        const message = createSiweMessage({
            address,
            chainId,
            domain: window.location.host,
            uri: window.location.host,
            nonce: generateSiweNonce(),
            version: '1',
            statement: `I'm the owner of ${protocol} and I want to update my STAKEX customization`,
        })

        setChallengeMessage(message)

        signMessage({ account: address, message })
    }

    const onClickCancel = () => {
        setCropImage(null)
        setPreviewImage(null)
    }

    useEffect(() => {
        if (!response) return

        if (response.data.logoUrl) setBaseImage(response.data.logoUrl)
    }, [response])

    useEffect(() => {
        const image = cropperRef.current?.getCanvas()?.toDataURL().split(',')[1]
        if (
            signature &&
            isLoadingLogoUpload &&
            chain &&
            challengeMessage &&
            image
        ) {
            update({
                chainId: chain.id,
                sig: signature,
                challenge: challengeMessage,
                protocol,
                styles: [],
                image,
            })
        }
    }, [isLoadingLogoUpload, signature, chain, challengeMessage])

    useEffect(() => {
        if (!loadingUpdate && responseUpdate) {
            load()
            setCropImage(null)
            setPreviewImage(null)
            toast.success('Updated project logo', { autoClose: 2000 })
        }
    }, [responseUpdate, loadingUpdate])

    return (
        <>
            <Tile className="w-full">
                <StakingProjectLogo
                    source={previewImage || baseImage}
                    projectName="DEGENX Ecosystem"
                />
            </Tile>

            {isOwner && (
                <Tile className="w-full">
                    <span className="flex-1 font-title text-xl font-bold">
                        Project Logo
                    </span>
                    <div className="mt-8 flex flex-col gap-4">
                        {!cropImage && (
                            <Button
                                onClick={onClickUploadLogo}
                                variant="primary"
                            >
                                Choose new logo
                            </Button>
                        )}
                        {cropImage && (
                            <>
                                <div className="max-h-[400px] h-full">
                                    <Cropper
                                        stencilComponent={CircleStencil}
                                        src={cropImage}
                                        ref={cropperRef}
                                        disabled={isLoadingLogoUpload}
                                        className={'cropper'}
                                    />
                                </div>
                                <div className="flex flex-col justify-end gap-4 md:flex-row">
                                    <Button
                                        disabled={isLoadingLogoUpload}
                                        onClick={onClickCancel}
                                        variant="secondary"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        disabled={isLoadingLogoUpload}
                                        onClick={onClickPreview}
                                        variant="secondary"
                                    >
                                        Preview
                                    </Button>
                                    <Button
                                        disabled={isLoadingLogoUpload}
                                        onClick={onClickUploadLogo}
                                        variant="secondary"
                                    >
                                        Change
                                    </Button>
                                    <Button
                                        disabled={isLoadingLogoUpload}
                                        onClick={onClickUpload}
                                        variant="primary"
                                    >
                                        {isLoadingLogoUpload && (
                                            <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                                                <Spinner theme="dark" />
                                                {isPendingSignMessage && (
                                                    <span>
                                                        wait for signing
                                                    </span>
                                                )}
                                                {!isPendingSignMessage && (
                                                    <span>upload logo</span>
                                                )}
                                            </span>
                                        )}

                                        {!isLoadingLogoUpload && 'Upload'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                    <input
                        accept=".gif,.jpg,.jpeg,.png,.webp,.svg"
                        type="file"
                        id="file"
                        ref={inputFile}
                        onChange={onChangeFileInput}
                        style={{ display: 'none' }}
                    />
                </Tile>
            )}
        </>

        // <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        //     <Tile className="w-full">
        //         <span className="flex-1 font-title text-xl font-bold">
        //             UI Appearance
        //         </span>
        //     </Tile>
        // </div>
    )
}
