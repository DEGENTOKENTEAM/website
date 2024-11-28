import { Spinner } from '@dappelements/Spinner'
import { visualAddress } from '@dapphelpers/address'
import { ManageStakeXContext } from '@dapphelpers/defitools'
import { toReadableNumber } from '@dapphelpers/number'
import { useGetChainExplorer } from '@dapphooks/shared/useGetChainExplorer'
import { useGetStakingData } from '@dapphooks/staking/useGetStakingData'
import { useGetTVLinUSD } from '@dapphooks/staking/useGetTVLinUSD'
import { usePeripheryGet } from '@dapphooks/staking/usePeripheryGet'
import { usePeripheryUpdate } from '@dapphooks/staking/usePeripheryUpdate'
import { useTokensGetTokens } from '@dapphooks/staking/useTokensGetTokens'
import { CaretDivider } from '@dappshared/CaretDivider'
import { BaseOverlay } from '@dappshared/overlays/BaseOverlay'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { Tile } from '@dappshared/Tile'
import clsx from 'clsx'
import { isUndefined } from 'lodash'
import { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CircleStencil, Cropper, CropperRef } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import { FaPen, FaRegCheckCircle, FaRegTimesCircle, FaSave } from 'react-icons/fa'
import { FaRegTrashCan } from 'react-icons/fa6'
import { IoMdOpen } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import { Button } from 'src/components/Button'
import { useInterval } from 'usehooks-ts'
import { createSiweMessage, CreateSiweMessageParameters, generateSiweNonce } from 'viem/siwe'
import { useAccount, useSignMessage } from 'wagmi'
import logoSmall from './../../../../../images/degenx_logo_small_bg_pattern.png'
import { VersionInformation } from './VersionInformation'

export const GeneralInformation = () => {
    const {
        data: { chain, protocol, owner, isActive, isRunning, stakingToken, isCampaign },
    } = useContext(ManageStakeXContext)

    const navigate = useNavigate()

    const chainExplorer = useGetChainExplorer(chain!)

    const { data: dataStakingData, isLoading: isLoadingStakingData } = useGetStakingData(protocol, chain?.id!)
    const { response: responseTVLinUSD, isComplete: isCompleteTVLinUSD } = useGetTVLinUSD(protocol, chain?.id!)
    const { data: dataGetTokens } = useTokensGetTokens(protocol, chain?.id!)

    ///
    /// Peripheral Data
    ///
    const { address } = useAccount()
    const [baseImageHero, setBaseImageHero] = useState<string | null>()
    const [baseImageLogo, setBaseImageLogo] = useState<string | null>()
    const [isPending, setIsPending] = useState(false)
    const [pendingPollMS, setPendingPollMS] = useState<number | null>(null)
    const { load: loadPeriphery, response: dataPeriphery } = usePeripheryGet(protocol, chain?.id!)
    const {
        update: updatePeriphery,
        loading: isLoadingPeripheryUpdate,
        response: responsePeripheryUpdate,
    } = usePeripheryUpdate()

    useEffect(() => {
        if (dataPeriphery && dataPeriphery.data) {
            dataPeriphery.data.heroBannerUrl && setBaseImageHero(dataPeriphery.data.heroBannerUrl)
            dataPeriphery.data.projectLogoUrl && setBaseImageLogo(dataPeriphery.data.projectLogoUrl)
            setIsPending(dataPeriphery.data.pending)
            setPendingPollMS(dataPeriphery.data.pending ? 5000 : null)
        }
    }, [dataPeriphery])

    useInterval(() => loadPeriphery(), pendingPollMS)

    ///
    /// Hero Banner Update
    ///
    const inputFileHero = useRef<HTMLInputElement | null>(null)
    const [isLoadingImageUploadHero, setIsLoadingImageUploadHero] = useState(false)
    const [previewImageHero, setPreviewImageHero] = useState<string | null>(null)
    const [previewImageHeroB64, setPreviewImageHeroB64] = useState<string | null>(null)

    const onClickUploadHero = () => {
        if (inputFileHero && inputFileHero.current) {
            inputFileHero.current.focus()
            inputFileHero.current.click()
        }
    }

    const onChangeFileInputHero = (_event: ChangeEvent<HTMLInputElement>) => {
        if (!_event.target.files || !_event.target.files?.length) return
        if (_event.target.files[0].size > 1024 * 1024 * 2) {
            _event.target.files = null
            toast.error(<span>The image is too big (max 5MB)</span>)
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => setPreviewImageHeroB64((reader as any).result.replace('data:', '').replace(/^.+,/, ''))
        reader.readAsDataURL(_event.target.files[0])
        setPreviewImageHero(URL.createObjectURL(_event.target.files[0]))
    }

    const onClickResetHero = () => {
        if (inputFileHero && inputFileHero.current) {
            inputFileHero.current.files = null
            setPreviewImageHero(null)
            setPreviewImageHeroB64(null)
        }
    }

    const onClickSaveHero = () => {
        if (inputFileHero && inputFileHero.current && inputFileHero.current.files) inputFileHero.current.files = null
        setIsLoadingImageUploadHero(true)
        startUpload()
    }

    ///
    /// Logo Update
    ///
    const inputFileLogo = useRef<HTMLInputElement | null>(null)
    const cropperLogoRef = useRef<CropperRef | null>(null)
    const [cropImageLogo, setCropImageLogo] = useState<string | null>(null)
    const [isLoadingImageUploadLogo, setIsLoadingImageUploadLogo] = useState(false)
    const [previewImageLogo, setPreviewImageLogo] = useState<string | null>(null)
    const [previewImageLogoB64, setPreviewImageLogoB64] = useState<string | null>(null)
    const onClickUploadLogo = () => {
        if (inputFileLogo && inputFileLogo.current) {
            inputFileLogo.current.focus()
            inputFileLogo.current.click()
        }
    }

    const onChangeFileInputLogo = (_event: ChangeEvent<HTMLInputElement>) => {
        if (!_event.target.files || !_event.target.files?.length) return
        if (_event.target.files[0].size > 1024 * 1024 * 2) {
            _event.target.files = null
            toast.error('File is too big. Maximum of 5 Mb', { toastId: 'filetobig' })
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => setPreviewImageLogoB64((reader as any).result.replace('data:', '').replace(/^.+,/, ''))
        reader.readAsDataURL(_event.target.files[0])
        setCropImageLogo(URL.createObjectURL(_event.target.files[0]))
    }

    const onClickProceedUpload = () => {
        const canvas = cropperLogoRef && cropperLogoRef.current && cropperLogoRef.current.getCanvas()
        if (canvas) {
            setPreviewImageLogo(canvas.toDataURL())
            setPreviewImageLogoB64(canvas.toDataURL().split(',')[1])
            setCropImageLogo(null)
        }
    }

    const onClickResetLogo = () => {
        if (inputFileLogo && inputFileLogo.current) {
            inputFileLogo.current.files = null
            setPreviewImageLogo(null)
            setPreviewImageLogoB64(null)
            setCropImageLogo(null)
        }
    }

    const onClickSaveLogo = () => {
        if (inputFileLogo && inputFileLogo.current && inputFileLogo.current.files) inputFileLogo.current.files = null
        setIsLoadingImageUploadLogo(true)
        startUpload()
    }

    ///
    /// Update Process
    ///
    const [challengeMessage, setChallengeMessage] = useState<string | null>(null)
    const {
        signMessage,
        data: signature,
        isPending: isPendingSignMessage,
        isError: isErrorSignMessage,
        reset: resetSignMessage,
    } = useSignMessage()

    const startUpload = useCallback(() => {
        if (!address || !chain || !chain.id) return

        const msg: CreateSiweMessageParameters = {
            address,
            chainId: chain?.id!,
            domain: `${window.location.host}`,
            uri: `${window.location.href}`,
            nonce: generateSiweNonce(),
            version: '1',
            statement: `I'm the owner of ${protocol} and I want to update my STAKEX customization`,
        }

        const siweMessage = createSiweMessage(msg)

        setChallengeMessage(siweMessage)

        signMessage({ account: address, message: siweMessage })
    }, [chain, address, protocol, signMessage])

    useEffect(() => {
        if (isErrorSignMessage) {
            setIsLoadingImageUploadHero(false)
            setIsLoadingImageUploadLogo(false)
        }
    }, [isErrorSignMessage])

    useEffect(() => {
        // const image = cropperRef.current?.getCanvas()?.toDataURL().split(',')[1]
        if (protocol && signature && chain && challengeMessage) {
            const data = {
                projectName: null,
                projectLogo: previewImageLogoB64 || null,
                heroBanner: previewImageHeroB64 || null,
            }

            updatePeriphery &&
                updatePeriphery({
                    chainId: chain.id,
                    sig: signature,
                    challenge: challengeMessage,
                    protocol,
                    data,
                })
        }
    }, [signature, chain, challengeMessage, protocol, previewImageLogoB64, previewImageHeroB64, updatePeriphery])

    useEffect(() => {
        if (responsePeripheryUpdate) {
            setIsLoadingImageUploadHero(false)
            setIsLoadingImageUploadLogo(false)
            resetSignMessage && resetSignMessage()

            if (responsePeripheryUpdate.message !== 'success') {
                toast.error(responsePeripheryUpdate.message, { toastId: 'errorUpdate' })
                return
            }

            // success
            setPreviewImageHero(null)
            setPreviewImageHeroB64(null)

            setPreviewImageLogo(null)
            setPreviewImageLogoB64(null)

            loadPeriphery && loadPeriphery()

            toast.success('Saved image successfully. Waiting for IPFS to update...', { toastId: 'successUpdate' })
        }
    }, [responsePeripheryUpdate, loadPeriphery, resetSignMessage])

    return (
        <Tile className="relative overflow-hidden !p-0">
            <div
                className={clsx([
                    'relative flex h-[350px] w-full flex-col items-center justify-center gap-8 bg-center',
                    (baseImageHero || previewImageHero) && 'bg-cover bg-no-repeat',
                    !baseImageHero && !previewImageHero && 'bg-gradient-to-tl from-dapp-cyan-500/40',
                ])}
                style={{
                    backgroundImage:
                        previewImageHero || baseImageHero
                            ? `radial-gradient(circle at center, #00000000 , #00000088), url('${
                                  previewImageHero ? previewImageHero : baseImageHero
                              }')`
                            : `radial-gradient(circle at center, #00000000 , #00000088), url('${logoSmall.src}')`,
                }}
            >
                <span className="absolute bottom-auto left-auto right-4 top-4 rounded-full bg-dapp-blue-800/80 hover:cursor-pointer">
                    {(isLoadingImageUploadHero || isPending) && (
                        <span className="flex flex-row items-center gap-2 p-5">
                            {isPendingSignMessage && <span className="whitespace-nowrap">Signing message...</span>}
                            {isLoadingPeripheryUpdate && <span className="whitespace-nowrap">Uploading image...</span>}
                            {isLoadingImageUploadHero && !isLoadingPeripheryUpdate && !isPendingSignMessage && (
                                <span className="whitespace-nowrap">Select image...</span>
                            )}
                            <Spinner className="!h-7 !w-7" />
                        </span>
                    )}
                    {!isLoadingImageUploadHero &&
                        !isPending &&
                        (previewImageHero ? (
                            <span className="flex flex-row">
                                <span onClick={onClickResetHero} className="m-4 p-1">
                                    <FaRegTrashCan className="size-5 fill-error/80" />
                                </span>
                                <span onClick={onClickSaveHero} className="m-4 p-1">
                                    <FaSave className="size-5" />
                                </span>
                            </span>
                        ) : (
                            <span onClick={onClickUploadHero} className="block p-6">
                                <FaPen className="size-5" />
                            </span>
                        ))}
                </span>
                <input
                    accept=".gif,.jpg,.jpeg,.png,.webp,.svg"
                    type="file"
                    id="file"
                    ref={inputFileHero}
                    onChange={onChangeFileInputHero}
                    style={{ display: 'none' }}
                />
                <input
                    accept=".gif,.jpg,.jpeg,.png,.webp,.svg"
                    type="file"
                    id="file"
                    ref={inputFileLogo}
                    onChange={onChangeFileInputLogo}
                    style={{ display: 'none' }}
                />
                <div
                    className={clsx([
                        'size-48 absolute -bottom-24 flex flex-row items-center justify-center rounded-full bg-dapp-blue-800 bg-contain bg-center bg-no-repeat shadow-md sm:left-24',
                    ])}
                    style={
                        previewImageLogo || baseImageLogo
                            ? {
                                  backgroundImage: `url('${previewImageLogo ? previewImageLogo : baseImageLogo}')`,
                              }
                            : {}
                    }
                >
                    <span className="absolute -bottom-1 -right-1 left-auto top-auto rounded-full bg-dapp-blue-800/90 hover:cursor-pointer">
                        {(isLoadingImageUploadLogo || isPending) && (
                            <span className="flex flex-row items-center gap-2 p-5">
                                {isPendingSignMessage && <span className="whitespace-nowrap">Signing message...</span>}
                                {isLoadingPeripheryUpdate && (
                                    <span className="whitespace-nowrap">Uploading image...</span>
                                )}
                                <Spinner className="!h-7 !w-7" />
                            </span>
                        )}
                        {!isLoadingImageUploadLogo &&
                            !isPending &&
                            (previewImageLogo ? (
                                <span className="flex flex-row">
                                    <span onClick={onClickResetLogo} className="m-4">
                                        <FaRegTrashCan className="size-5 m-1 fill-error/80" />
                                    </span>
                                    <span onClick={onClickSaveLogo} className="m-4">
                                        <FaSave className="size-5 m-1" />
                                    </span>
                                </span>
                            ) : (
                                <span onClick={onClickUploadLogo} className="block p-6">
                                    <FaPen className="size-5" />
                                </span>
                            ))}
                    </span>
                </div>
                <div className="absolute bottom-2 right-2 rounded-full bg-dapp-blue-800/70 p-1 px-2 text-sm text-darkTextLowEmphasis">
                    <VersionInformation />
                </div>
            </div>
            <div className="mt-24 flex w-full flex-col gap-4 p-4 sm:gap-8 sm:p-8">
                <StatsBoxTwoColumn.Wrapper className="w-full rounded-lg bg-dapp-blue-800 p-2 text-sm sm:p-4">
                    <div className="col-span-2">
                        <span className="font-bold">Protocol address</span>
                        <br />
                        <span className="flex flex-row items-center gap-2 font-mono text-sm">
                            <span className=" xs:hidden">{visualAddress(protocol, 8)}</span>
                            <span className="hidden text-xs xs:inline sm:text-sm">{protocol}</span>
                            {chainExplorer && stakingToken && (
                                <a
                                    href={chainExplorer.getAddressUrl(protocol)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-row items-center justify-start"
                                >
                                    <IoMdOpen />
                                </a>
                            )}
                        </span>
                    </div>
                    <div className="col-span-2 mt-4">
                        <span className="font-bold">Owner address</span>
                        <br />
                        <span className="flex flex-row items-center gap-2 font-mono text-sm">
                            <span className=" xs:hidden">{owner && visualAddress(owner, 8)}</span>
                            <span className="hidden text-xs xs:inline sm:text-sm">{owner}</span>
                            {chainExplorer && stakingToken && (
                                <a
                                    href={chainExplorer.getAddressUrl(owner)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-row items-center justify-start"
                                >
                                    <IoMdOpen />
                                </a>
                            )}
                        </span>
                    </div>
                    <div className="col-span-2 mt-4">
                        <span className="font-bold">Staking token address</span>
                        <br />
                        <span className="flex flex-row items-center gap-2 font-mono text-sm">
                            <span className="xs:hidden">{stakingToken && visualAddress(stakingToken.source, 8)}</span>
                            <span className="hidden text-xs xs:inline sm:text-sm">
                                {stakingToken && stakingToken.source}
                            </span>
                            {chainExplorer && stakingToken && (
                                <a
                                    href={chainExplorer.getTokenUrl(stakingToken.source)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-row items-center justify-start"
                                >
                                    <IoMdOpen />
                                </a>
                            )}
                        </span>
                    </div>
                    {isCampaign && (
                        <div className="col-span-2 mt-4">
                            <span className="font-bold">Reward token address</span>
                            <br />
                            <span className="flex flex-row items-center gap-2 font-mono text-sm">
                                <span className="xs:hidden">
                                    {dataGetTokens && dataGetTokens[0] && visualAddress(dataGetTokens[0].source, 8)}
                                </span>
                                <span className="hidden text-xs xs:inline sm:text-sm">
                                    {dataGetTokens && dataGetTokens[0] && dataGetTokens[0].source}
                                </span>
                                {chainExplorer && dataGetTokens && dataGetTokens[0] && (
                                    <a
                                        href={chainExplorer.getTokenUrl(dataGetTokens[0].source)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex flex-row items-center justify-start"
                                    >
                                        <IoMdOpen />
                                    </a>
                                )}
                            </span>
                        </div>
                    )}

                    {!isCampaign && (
                        <>
                            <div className="col-span-2">
                                <CaretDivider />
                            </div>

                            <StatsBoxTwoColumn.LeftColumn>
                                Staked {stakingToken && stakingToken.symbol}
                            </StatsBoxTwoColumn.LeftColumn>
                            <StatsBoxTwoColumn.RightColumn>
                                <div className="flex justify-end">
                                    {!isLoadingStakingData &&
                                        !isUndefined(dataStakingData) &&
                                        stakingToken &&
                                        dataStakingData &&
                                        `${dataStakingData.staked.amount > 0n ? '~' : ''}${toReadableNumber(
                                            dataStakingData.staked.amount,
                                            dataStakingData.staked.tokenInfo.decimals,
                                            {
                                                maximumFractionDigits: 2,
                                                minimumFractionDigits: 2,
                                            }
                                        )}`}
                                </div>
                            </StatsBoxTwoColumn.RightColumn>

                            <StatsBoxTwoColumn.LeftColumn>$ Total Value Locked</StatsBoxTwoColumn.LeftColumn>
                            <StatsBoxTwoColumn.RightColumn>
                                {Boolean(responseTVLinUSD) ? (
                                    <div className="flex justify-end">
                                        ~$
                                        {toReadableNumber(responseTVLinUSD, 0, {
                                            maximumFractionDigits: 2,
                                            minimumFractionDigits: 2,
                                        })}{' '}
                                        {!isCompleteTVLinUSD && <span className="text-xs">(incomplete)</span>}
                                    </div>
                                ) : (
                                    <div className="flex justify-end">n/a</div>
                                )}
                            </StatsBoxTwoColumn.RightColumn>

                            <div className="col-span-2">
                                <CaretDivider />
                            </div>

                            <StatsBoxTwoColumn.LeftColumn>Protocol active?</StatsBoxTwoColumn.LeftColumn>
                            <StatsBoxTwoColumn.RightColumn>
                                <div className="flex justify-end">
                                    {isActive ? (
                                        <FaRegCheckCircle className="size-5 text-success" />
                                    ) : (
                                        <FaRegTimesCircle className="size-5 text-error" />
                                    )}
                                </div>
                            </StatsBoxTwoColumn.RightColumn>

                            <StatsBoxTwoColumn.LeftColumn>Protocol running?</StatsBoxTwoColumn.LeftColumn>
                            <StatsBoxTwoColumn.RightColumn>
                                <div className="flex justify-end">
                                    {isRunning ? (
                                        <FaRegCheckCircle className="size-5 text-success" />
                                    ) : (
                                        <FaRegTimesCircle className="size-5 text-error" />
                                    )}
                                </div>
                            </StatsBoxTwoColumn.RightColumn>
                        </>
                    )}
                </StatsBoxTwoColumn.Wrapper>

                {!isCampaign && stakingToken && chain && (
                    <div className="col-span-2">
                        <Button
                            className="w-full"
                            disabled={!isRunning}
                            onClick={() => {
                                navigate(`/dapp/staking/${chain.id}/${protocol}`, {
                                    relative: 'path',
                                })
                            }}
                            variant="primary"
                        >
                            Stake {stakingToken.symbol}
                        </Button>
                    </div>
                )}
            </div>
            <BaseOverlay isOpen={Boolean(cropImageLogo)} closeOnBackdropClick={false} onClose={() => {}}>
                <div className="flex flex-col gap-4">
                    <div>
                        <Cropper
                            stencilComponent={CircleStencil}
                            src={cropImageLogo}
                            ref={cropperLogoRef}
                            className={'cropper'}
                            stencilProps={{ aspectRatio: 1 }}
                            minWidth={300}
                            minHeight={300}
                        />
                    </div>
                    <Button onClick={onClickProceedUpload} variant="primary">
                        Select this area
                    </Button>
                    <Button onClick={onClickResetLogo} variant="secondary">
                        Cancel
                    </Button>
                </div>
            </BaseOverlay>
            <ToastContainer />
        </Tile>
    )
}
