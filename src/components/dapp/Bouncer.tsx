import bs58 from 'bs58'
import { ConnectKitButton } from 'connectkit'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { IoShieldCheckmarkOutline } from 'react-icons/io5'
import { PiPlugsConnected } from 'react-icons/pi'
import { VscDebugDisconnect } from 'react-icons/vsc'
import { useParams } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import { useSignMessage } from 'wagmi'

// SOLANA
import { Adapter, WalletError } from '@solana/wallet-adapter-base'
import {
    ConnectionProvider,
    WalletProvider,
    useWallet,
} from '@solana/wallet-adapter-react'
import {
    WalletModalProvider,
    WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'

// CUSTOM
import { visualAddress } from '../../helpers/address'
import { useFinishVerification } from '../../hooks/bouncer/useFinishVerification'
import { useGetVerificationData } from '../../hooks/bouncer/useGetVerificationData'
import { useVerifyWallet } from '../../hooks/bouncer/useVerifyWallet'
import { Button } from '../Button'
import { Spinner } from './elements/Spinner'

type VerifyButtonSolanaProps = {
    keyToVerify: string
    addressToVerify: string
    messageToVerify: string
    onVerificationStatusUpdate: () => void
}

const VerifyButtonSolana: FC<VerifyButtonSolanaProps> = (props) => {
    const {
        keyToVerify,
        addressToVerify,
        messageToVerify,
        onVerificationStatusUpdate,
    } = props
    const [isLoading, setIsLoading] = useState(false)
    const [signMessageData, setSignMessageData] = useState(null)
    const { wallet, connected, publicKey, signMessage } = useWallet()

    const {
        error: errorVerifyWallet,
        isLoading: isLoadingVerifyWallet,
        request: requestVerifyWallet,
        response: responseVerifyWallet,
    } = useVerifyWallet()

    const verify = () => {
        setIsLoading(true)
        signMessage(new TextEncoder().encode(messageToVerify))
            .then((res: Uint8Array) => {
                setSignMessageData(bs58.encode(res))
            })
            .catch((e) => {
                console.log({ e })
                toast.error(`Signing request canceled`)
                setIsLoading(false)
            })
    }

    useEffect(() => {
        if (
            !signMessageData ||
            !keyToVerify ||
            !addressToVerify ||
            !requestVerifyWallet
        )
            return
        requestVerifyWallet &&
            requestVerifyWallet({
                keyToVerify,
                addressToVerify,
                signMessageData: signMessageData,
            })
    }, [addressToVerify, keyToVerify, signMessageData, requestVerifyWallet])

    useEffect(() => {
        setSignMessageData(null)
        if (errorVerifyWallet) {
            toast.error(errorVerifyWallet)
            setIsLoading(false)
        }
        if (responseVerifyWallet) {
            onVerificationStatusUpdate()
            setIsLoading(false)
        }
    }, [
        onVerificationStatusUpdate,
        setSignMessageData,
        responseVerifyWallet,
        errorVerifyWallet,
    ])

    if (!connected)
        return (
            <WalletMultiButton>
                {wallet ? '' : <VscDebugDisconnect className="inline-block" />}{' '}
                Connect wallet to verify
            </WalletMultiButton>
        )

    if (connected && addressToVerify === publicKey.toBase58()) {
        return (
            <button
                onClick={verify}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-lg border p-2 dark:border-activeblue dark:bg-darkblue dark:text-light-200 dark:hover:bg-activeblue"
            >
                {isLoading || isLoadingVerifyWallet ? (
                    <Spinner theme="dark" />
                ) : (
                    <>
                        <PiPlugsConnected className="inline-block" /> Verify now
                    </>
                )}
            </button>
        )
    } else {
        return (
            <div className="flex items-center justify-center gap-2">
                <VscDebugDisconnect className="inline-block" /> Change wallet to
                verify
            </div>
        )
    }
}

const VerifyButtonSolanaContext: FC<VerifyButtonSolanaProps> = (props) => {
    const onError = useCallback((error: WalletError, adapter?: Adapter) => {
        toast.error(
            error.message ? `${error.name}: ${error.message}` : error.name
        )
        console.error(error, adapter)
    }, [])
    const wallets = useMemo(
        () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )
    return (
        <ConnectionProvider endpoint={process.env.NEXT_PUBLIC_RPC_SOLANA}>
            <WalletProvider wallets={wallets} onError={onError}>
                <WalletModalProvider>
                    <VerifyButtonSolana {...props} />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

const VerifyButtonEVM = (props: {
    keyToVerify: string
    addressToVerify: string
    messageToVerify: string
    onVerificationStatusUpdate: () => void
}) => {
    const { keyToVerify, addressToVerify, onVerificationStatusUpdate } = props
    const [isLoading, setIsLoading] = useState(false)
    const {
        data: signMessageData,
        isLoading: isLoadingSigneMessage,
        reset,
        signMessage,
    } = useSignMessage()

    const {
        error,
        isLoading: isLoadingVerifyWallet,
        request,
        response,
    } = useVerifyWallet()

    const verify = () => {
        setIsLoading(true)
        signMessage({ message: props.messageToVerify })
    }

    useEffect(() => {
        if (!signMessageData || !keyToVerify || !addressToVerify || !request)
            return

        request({ keyToVerify, addressToVerify, signMessageData })
    }, [keyToVerify, addressToVerify, signMessageData, request])

    useEffect(() => {
        reset()
        if (error) {
            toast.error(error)
            setIsLoading(false)
        }
        if (response) {
            onVerificationStatusUpdate()
            setIsLoading(false)
        }
    }, [error, response, setIsLoading, reset, onVerificationStatusUpdate])

    return (
        <ConnectKitButton.Custom>
            {({
                isConnected,
                isConnecting,
                show,
                hide,
                address,
                ensName,
                chain,
            }) => {
                if (!isConnected)
                    return (
                        <button
                            onClick={show}
                            className="flex items-center justify-center gap-2 rounded-lg border p-2 dark:border-activeblue dark:bg-darkblue dark:text-light-200 dark:hover:bg-activeblue"
                        >
                            <VscDebugDisconnect className="inline-block" />{' '}
                            Connect wallet to verify
                        </button>
                    )

                if (props.addressToVerify === address) {
                    return (
                        <button
                            onClick={verify}
                            disabled={isLoadingSigneMessage}
                            className="flex items-center justify-center gap-2 rounded-lg border p-2 dark:border-activeblue dark:bg-darkblue dark:text-light-200 dark:hover:bg-activeblue"
                        >
                            {isLoading ||
                            isLoadingSigneMessage ||
                            isLoadingVerifyWallet ? (
                                <Spinner theme="dark" />
                            ) : (
                                <>
                                    <PiPlugsConnected className="inline-block" />{' '}
                                    Verify now
                                </>
                            )}
                        </button>
                    )
                } else {
                    return (
                        <div className="flex items-center justify-center gap-2">
                            <VscDebugDisconnect className="inline-block" />{' '}
                            Change wallet to verify
                        </div>
                    )
                }
            }}
        </ConnectKitButton.Custom>
    )
}

export const Bouncer = () => {
    const { hash } = useParams()

    const [verificationData, reloadVerificationData] =
        useGetVerificationData(hash)

    const {
        request: finishVerification,
        response,
        isLoading: isFinishVerificationLoading,
        error,
    } = useFinishVerification(hash)

    const canFinishVerification = !verificationData?.data?.items?.find(
        (item) => !item.verified
    )

    const onVerificationStatusUpdate = () => {
        reloadVerificationData()
    }

    useEffect(() => {
        if (error || response) reloadVerificationData()
        if (error) toast.error(error.message, { autoClose: 5000 })
        if (response) toast.success(response.message, { autoClose: 5000 })
    }, [response, error, reloadVerificationData])

    return (
        <div>
            <h1 className="mb-5 mt-4 flex flex-col gap-1 font-title text-3xl font-bold tracking-wide lg:mb-8 lg:flex-row">
                <span className="text-techGreen">Bouncer</span>
                <span className="text-degenOrange">WalletVerification</span>
            </h1>
            <div className="mb-4  rounded-xl border-2 border-degenOrange bg-light-100 p-4 text-light-200 dark:border-activeblue  dark:bg-darkerblue  dark:text-light-200">
                <p>
                    If you&apos;re visiting this site, it&apos;s likely because
                    you received the URL from our DEGENX Bouncer. Through this
                    form, the bouncer ensures that everything is in order with
                    your mentioned wallets.
                    <br />
                    <br />
                    Please connect and verify all your wallets, so we can invite
                    you to the group.
                </p>
            </div>
            <div className="mb-4 lg:rounded-xl lg:border-2 lg:border-degenOrange lg:bg-light-100 lg:text-light-200 lg:dark:border-activeblue  lg:dark:bg-darkerblue  lg:dark:text-light-200">
                {!verificationData && (
                    <div className="flex items-center justify-center p-3">
                        <Spinner theme="dark" />
                    </div>
                )}

                {verificationData && verificationData.message && (
                    <div className="flex items-center justify-center p-3">
                        {verificationData.message}
                    </div>
                )}

                {verificationData &&
                    verificationData.data &&
                    !verificationData.data.verificationFinished &&
                    verificationData.data.items?.length > 0 && (
                        <table className="hidden w-full border-collapse items-center lg:table">
                            <thead>
                                <tr>
                                    <th className="bg-blueGray-50 whitespace-nowrap border-2 border-l-0 border-r-0 border-t-0 border-solid border-activeblue px-6 py-3 text-left align-middle font-semibold uppercase">
                                        Wallet
                                    </th>
                                    <th className="bg-blueGray-50 whitespace-nowrap border-2 border-l-0 border-r-0 border-t-0 border-solid border-activeblue px-6 py-3 text-right align-middle font-semibold uppercase">
                                        DGNX
                                    </th>
                                    <th className="bg-blueGray-50 whitespace-nowrap border-2 border-l-0 border-r-0 border-t-0 border-solid border-activeblue px-6 py-3 text-center align-middle font-semibold uppercase">
                                        Verified?
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {verificationData.data.items?.map((item, k) => (
                                    <tr key={item.wallet}>
                                        <td className="h-[76px] whitespace-nowrap border-2 border-l-0 border-r-0 border-t-0 border-activeblue p-4 px-6 text-left align-middle">
                                            {visualAddress(item.wallet)}
                                        </td>
                                        <td className="h-[76px] whitespace-nowrap border-2 border-l-0 border-r-0 border-t-0 border-activeblue p-4 px-6 text-right align-middle">
                                            {item.amount.toLocaleString(
                                                navigator.language,
                                                {
                                                    minimumFractionDigits: 3,
                                                    maximumFractionDigits: 3,
                                                }
                                            )}
                                        </td>
                                        <td className="h-[76px] whitespace-nowrap border-2 border-l-0 border-r-0 border-t-0 border-activeblue p-4 px-6 text-center align-middle">
                                            <div className="flex justify-center">
                                                {item.verified ? (
                                                    <div className="flex items-center justify-center gap-1 text-green-500">
                                                        <IoShieldCheckmarkOutline className="inline-block" />
                                                        Verified
                                                    </div>
                                                ) : item.network === 'evm' ? (
                                                    <VerifyButtonEVM
                                                        onVerificationStatusUpdate={
                                                            onVerificationStatusUpdate
                                                        }
                                                        keyToVerify={
                                                            verificationData
                                                                .data.key
                                                        }
                                                        addressToVerify={
                                                            item.wallet
                                                        }
                                                        messageToVerify={
                                                            item.verifyMessage
                                                        }
                                                    />
                                                ) : (
                                                    <VerifyButtonSolanaContext
                                                        onVerificationStatusUpdate={
                                                            onVerificationStatusUpdate
                                                        }
                                                        keyToVerify={
                                                            verificationData
                                                                .data.key
                                                        }
                                                        addressToVerify={
                                                            item.wallet
                                                        }
                                                        messageToVerify={
                                                            item.verifyMessage
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="whitespace-nowrap border-l-0 border-r-0 border-t-0 p-4 px-6 text-right align-middle">
                                        Total
                                    </td>
                                    <td className="whitespace-nowrap border-l-0 border-r-0 border-t-0 p-4 px-6 text-right align-middle">
                                        {verificationData.data.totalAmount.toLocaleString(
                                            navigator.language,
                                            {
                                                minimumFractionDigits: 3,
                                                maximumFractionDigits: 3,
                                            }
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap border-l-0 border-r-0 border-t-0 p-4 px-6 text-center">
                                        <Button
                                            onClick={finishVerification}
                                            disabled={!canFinishVerification}
                                            color={
                                                !canFinishVerification
                                                    ? 'disabled'
                                                    : 'orange'
                                            }
                                        >
                                            {isFinishVerificationLoading ? (
                                                <Spinner />
                                            ) : (
                                                <>Finish verification</>
                                            )}
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                {verificationData &&
                    verificationData.data &&
                    !verificationData.data.verificationFinished &&
                    verificationData.data.items?.length > 0 && (
                        <div className="lg:hidden">
                            {verificationData.data.items?.map((item, k) => (
                                <div
                                    key={item.wallet}
                                    className="mb-4 flex flex-col gap-2 rounded-lg border-2 border-degenOrange p-4 dark:border-activeblue dark:bg-darkerblue  dark:text-light-200"
                                >
                                    <p className="text-center">
                                        <span className="md:hidden">
                                            {visualAddress(item.wallet)}
                                        </span>
                                        <span className="hidden md:inline">
                                            {item.wallet}
                                        </span>
                                    </p>
                                    <p className="text-center">
                                        {item.amount.toLocaleString(
                                            navigator.language,
                                            {
                                                minimumFractionDigits: 3,
                                                maximumFractionDigits: 3,
                                            }
                                        )}{' '}
                                        DGNX
                                    </p>
                                    <div className="text-center">
                                        {item.verified ? (
                                            <div className="flex items-center justify-center gap-1 text-green-500">
                                                <IoShieldCheckmarkOutline className="inline-block" />
                                                Verified
                                            </div>
                                        ) : (
                                            <VerifyButtonEVM
                                                onVerificationStatusUpdate={
                                                    onVerificationStatusUpdate
                                                }
                                                keyToVerify={
                                                    verificationData.data.key
                                                }
                                                addressToVerify={item.wallet}
                                                messageToVerify={
                                                    item.verifyMessage
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className="mb-4 flex flex-col gap-2 rounded-lg border-2 border-degenOrange p-4 text-center dark:border-activeblue  dark:bg-darkerblue dark:text-light-200">
                                Total amount:{' '}
                                {verificationData.data.totalAmount.toLocaleString(
                                    navigator.language,
                                    {
                                        minimumFractionDigits: 3,
                                        maximumFractionDigits: 3,
                                    }
                                )}{' '}
                                DGNX
                            </div>
                            <div>
                                <Button
                                    onClick={finishVerification}
                                    disabled={!canFinishVerification}
                                    className="w-full"
                                    color={
                                        !canFinishVerification
                                            ? 'disabled'
                                            : 'orange'
                                    }
                                >
                                    {isFinishVerificationLoading ? (
                                        <Spinner />
                                    ) : (
                                        <>Finish verification</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                {verificationData &&
                    verificationData.data &&
                    verificationData.data.verificationFinished && (
                        <div className="flex items-center justify-center p-3">
                            <p className="text-center">
                                You&apos;ve finished the verification
                                successfully.
                                <br />
                                <br />
                                You should have received an invite link through
                                Telegram
                            </p>
                        </div>
                    )}
            </div>
            <ToastContainer />
        </div>
    )
}
