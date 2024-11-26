import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import logoImage from '../../../images/logo_large.png'
import logoImageSingle from '../../../images/logo_large_single.png'
import { CustomConnectedButton } from '../CustomConnectButton'
import { DappContainer } from './DappContainer'
import Sidebar from './Sidebar'

const TokenImage = (props: { src: string; symbol: string; size?: number }) => {
    const [showImage, setShowImage] = useState(true)

    useEffect(() => {
        setShowImage(true)
    }, [props.src])

    return (
        <div className="relative flex size-8 items-center justify-center rounded-full">
            <div
                style={{ display: showImage ? undefined : 'flex' }}
                className="absolute hidden size-full items-center justify-center rounded-full bg-slate-800 font-bold text-white"
            >
                {props.symbol[0]}
            </div>
            <Image
                className="absolute"
                width={props.size || 32}
                height={props.size || 32}
                src={props.src}
                alt={`Logo ${props.symbol}`}
                style={{ display: showImage ? undefined : 'none' }}
                onError={(e) => {
                    setShowImage(false)
                }}
            />
        </div>
    )
}

export function DappHeader() {
    return (
        <header className="absolute z-10 w-full bg-gradient-to-b from-dapp-blue-800 from-20% lg:fixed">
            <DappContainer>
                <nav className="relative z-50 flex flex-col items-center justify-between gap-6 p-4 md:flex-row lg:py-6">
                    <div className="flex w-full flex-row items-center">
                        <div className="mr-3 hidden md:inline-block lg:hidden">
                            <Sidebar mobile />
                        </div>
                        <Link href="/" aria-label="Home">
                            <Image src={logoImage} alt="" height={48} className="hidden sm:inline-block" />
                            <Image src={logoImageSingle} alt="" height={48} className="sm:hidden" />
                        </Link>
                        <div className="flex grow items-center justify-end pr-8 md:pr-0">
                            <CustomConnectedButton />
                        </div>
                        <div className="mr-3 md:hidden">
                            <Sidebar mobile />
                        </div>
                    </div>
                </nav>
            </DappContainer>
        </header>
    )
}
