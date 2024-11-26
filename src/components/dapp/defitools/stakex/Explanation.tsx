import { Tile } from '@dappshared/Tile'
import imageStakingFlexible from '@images/defitools/stakex/flexible.png'
import imageStakingCampaign from '@images/defitools/stakex/campaign.png'
import Image from 'next/image'
import { Button } from 'src/components/Button'
import { useNavigate } from 'react-router-dom'

export const Explanation = () => {
    const navigate = useNavigate()

    return (
        <div className="mb-8 flex flex-col gap-8 text-dapp-cyan-50">
            <h1 className="flex w-full max-w-2xl flex-col items-start gap-1 px-8 font-title text-3xl font-bold tracking-wide sm:px-0 md:flex-row md:gap-4">
                <span>
                    <span className="text-techGreen">STAKE</span>
                    <span className="text-degenOrange">X</span>
                </span>
                <span>Staking Solutions</span>
            </h1>
            <Tile className="p-8">
                Our staking protocol provides crypto projects with advanced flexibility and control, allowing them to
                set up customizable staking pools with multiple reward options or launch time-limited staking campaigns
                for targeted engagement — <span className="font-bold">all completely free of charge.</span>
                <br />
                <br />
                Unlike traditional staking solutions, our protocol enables project owners to tailor lock-up periods,
                reward distributions, and fees, helping to boost user retention and align seamlessly with each
                project&apos;s unique goals.
            </Tile>

            <Tile className="grid gap-4 !p-4 md:grid-cols-7">
                <div className="md:col-span-4">
                    <Image src={imageStakingFlexible} alt="Flexible Staking Image" />
                </div>
                <div className="flex flex-col gap-4 px-4 py-2 md:col-span-3 md:gap-2 md:px-0">
                    <h2 className="text-2xl font-bold">Flexible Staking Pools</h2>
                    <ul className="flex grow flex-col gap-2 text-left text-sm leading-5">
                        <li>
                            <span className="font-bold">Customizable Lock-Up Options: </span>Choose from no lock-up,
                            fixed lock-up, or infinite lock-up (tokens burned).
                        </li>
                        <li>
                            <span className="font-bold">Multiple Reward Tokens: </span>Rewards available in various
                            tokens, with flexibility to withdraw or re-stake.
                        </li>
                        <li>
                            <span className="font-bold">Optional Fees: </span>Set fees for actions like deposits,
                            withdrawals, re-staking, and up-staking to boost engagement.
                        </li>
                        <li>
                            <span className="font-bold">“Set-and-Forget” Convenience: </span>With a lock-up, stakers can
                            simply collect rewards without managing the staked tokens.
                        </li>
                    </ul>
                    <div className="flex animate-pulse flex-row justify-end">
                        <Button
                            variant="primary"
                            onClick={() => {
                                navigate('./regulars/create', { relative: 'route' })
                            }}
                            className="grow !p-4 !px-8 text-xl"
                        >
                            Create Flexible Staking
                        </Button>
                    </div>
                </div>
            </Tile>
            <Tile className="grid gap-4 !p-4 md:grid-cols-7">
                <div className="md:col-span-4">
                    <Image src={imageStakingCampaign} alt="Campaign Staking Image" />
                </div>
                <div className="flex flex-col gap-4 px-4 py-2 md:col-span-3 md:gap-2 md:px-0">
                    <h2 className="text-2xl font-bold">Time-Limited Campaign Staking</h2>
                    <ul className="flex grow flex-col gap-2 text-left text-sm leading-5">
                        <li>
                            <span className="font-bold">Fixed Campaign Duration: </span>Staking available only for a
                            specified period, like a limited-time campaign.
                        </li>
                        <li>
                            <span className="font-bold">Defined Reward Pool: </span>Campaign manager sets the total
                            reward amount and distribution timeline.
                        </li>
                        <li>
                            <span className="font-bold">Flexible Rewards Withdrawal: </span>Rewards can be withdrawn
                            anytime during the campaign.
                        </li>
                        <li>
                            <span className="font-bold">End-of-Campaign Payout: </span>Stakers must withdraw their
                            tokens at the end of the campaign to join future events.
                        </li>
                    </ul>
                    <div className="flex animate-pulse flex-row justify-end">
                        <Button
                            variant="primary"
                            onClick={() => {
                                navigate('./campaigns/create', { relative: 'route' })
                            }}
                            className="grow !p-4 !px-8 text-xl"
                        >
                            Create Campaign Staking
                        </Button>
                    </div>
                </div>
            </Tile>
        </div>
    )
}
