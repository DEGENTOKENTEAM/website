/* eslint-disable react/no-unescaped-entities */
import { Button } from './Button'
import { Container } from './Container'

import { H1 } from './H1'

import { FaTelegramPlane } from 'react-icons/fa'
import { SiLinktree } from 'react-icons/si'

export function CallToAction() {
    return (
        <Container className="py-10" id="join">
            <div className="mt-5 grid grid-cols-1 gap-3 rounded-lg border-2 border-activeblue bg-darkerblue px-8 py-6 md:grid-cols-3 md:gap-8 lg:px-16 lg:py-12">
                <div className="md:col-span-2">
                    <p className="mb-5 font-semibold text-light-600">
                        Explore, connect, and learn with us today!
                    </p>
                    <p className="mb-5  text-white">
                        Navigating our ecosystem is a breeze with us! Our team
                        is active daily in our vibrant Telegram community group,
                        ready to guide you on your exciting journey. Don't miss
                        out on the wealth of information and support available.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            variant="outline"
                            color="orange"
                            href="https://t.me/DEGENXecosystem"
                            target="_blank"
                            className="flex gap-1 py-1 text-xs font-extrabold uppercase md:py-2"
                        >
                            Join us on Telegram <FaTelegramPlane />
                        </Button>
                        <Button
                            variant="outline"
                            color="orange"
                            href="https://linktr.ee/DEGENX"
                            target="_blank"
                            className="flex gap-1 py-1 text-xs font-extrabold uppercase md:py-2"
                        >
                            Find our social links <SiLinktree />
                        </Button>
                    </div>
                </div>
                <div className="order-first md:order-last">
                    <H1 className="leading-10">
                        Join us and grow{' '}
                        <span className="text-degenOrange">together</span>
                    </H1>
                </div>
            </div>
        </Container>
    )
}
