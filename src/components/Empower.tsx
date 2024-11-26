import Image from 'next/image'
import { Button } from './Button'
import { Container } from './Container'

import { H1 } from './H1'
import { H2 } from './H2'

const Block = (props: { title: String; text: string }) => {
    return (
        <div>
            <H2 className="text-techGreen dark:text-techGreen">{props.title}</H2>
            <p className="font-bold text-white">{props.text}</p>
        </div>
    )
}

export function Empower() {
    return (
        <Container className="pb-10 text-center sm:pt-10" id="holder">
            <div className="mx-8 text-center md:mx-0 md:text-left">
                <H1 className="leading-[100%] text-white">
                    Be
                    <span className="my-0 block px-2 text-degenOrange sm:inline">empowered</span>
                    as a holder
                </H1>
            </div>
            <p className="mx-8 max-w-2xl text-left text-base font-semibold text-light-600 md:mx-0">
                As a holder of DGNX, you can embrace the world of DeFi and rest easy!
            </p>
            <div className="mt-5 grid grid-cols-1 gap-5 rounded-lg border-2 border-activeblue bg-darkerblue px-8 py-5 text-left md:grid-cols-2 lg:px-16 lg:py-12">
                <Block
                    title="Control"
                    text="Become a true ecosystem owner. Shape the future through on-chain proposals and DAO voting. The future truly is yours! Join us now for real ownership!"
                />
                <Block
                    title="Prosperity"
                    text="Revenue is distributed to our loyal stakers, ensuring you share in our success and growth. As our ecosystem thrives, so do your rewards!"
                />
                <Block
                    title="Safety"
                    text="Safety First! 100% audited smart contracts and full team KYC ensure complete transparency. Your security is our top priority, creating a safe ecosystem."
                />
                <Block
                    title="Security"
                    text="Enjoy maximum security with our liquidity backing mechanism. Your investments are safeguarded, allowing you to focus on exploring our ecosystem."
                />
            </div>
        </Container>
    )
}
