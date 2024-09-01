import { CallToActionButton } from './CallToAction'
import heroImage from './../../../images/lps/stakex/hero.png'
import Image from 'next/image'

export const Hero = () => {
    return (
        <div className="h-[80vh] w-full bg-dapp-blue-800/70">
            <div className="m-auto grid h-full max-w-7xl grid-cols-1 md:grid-cols-2">
                <div className="flex flex-col justify-center gap-4 p-10">
                    <span className="font-title text-2xl font-bold">
                        <span className="text-techGreen">STAKE</span>
                        <span className="text-degenOrange">X</span> Staking Protocol
                    </span>
                    <span className="text-xl">
                        Store the value of your project by animating and incentivizing your project token holders to
                        stake and lock their tokens in an audited, secure, and innovative staking protocol.
                    </span>
                    <div>
                        <CallToActionButton />
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center ">
                    <Image src={heroImage} alt="Hero Banner Image" className="w-3/4 rounded-lg" />
                </div>
            </div>
        </div>
    )
}
