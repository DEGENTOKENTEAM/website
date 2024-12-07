import { toReadableNumber } from '@dapphelpers/number'
import { AnimatedProgressBar } from '@dappshared/AnimatedProgressBar'
import { CaretDivider } from '@dappshared/CaretDivider'
import { NumberIncreaser } from '@dappshared/NumberIncreaser'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { Tile } from '@dappshared/Tile'
import { CampaignData, TokenInfoResponse } from '@dapptypes'
import Countdown from 'react-countdown'
import { IoMdOpen } from 'react-icons/io'
import { Link } from 'react-router-dom'

type CampaignTileStartedProps = {
    campaign: CampaignData
    stakingToken: TokenInfoResponse
    rewardToken: TokenInfoResponse
    goToDetails: (campaign: CampaignData) => void
}
export const CampaignTileStarted = ({ campaign, rewardToken, stakingToken, goToDetails }: CampaignTileStartedProps) => {
    return (
        <Tile className="flex flex-col gap-6">
            <div className="text-left font-bold">Campaign: {campaign.config.name}</div>
            <div className="flex flex-row items-center">
                <div className="border-r-2 border-[#4aad6b] py-2 pr-4">🚀</div>
                <div className="flex grow flex-col text-center text-sm font-bold">
                    <div>
                        rewarded{' '}
                        <span className="tabular-nums">
                            {
                                <NumberIncreaser
                                    startNumber={
                                        (campaign.config.rewardAmount *
                                            (BigInt(campaign.config.period) - campaign.stats.timeLeft)) /
                                        BigInt(campaign.config.period)
                                    }
                                    endNumber={campaign.config.rewardAmount}
                                    decimals={18n}
                                    duration={BigInt(campaign.config.period)}
                                />
                            }
                        </span>{' '}
                        RTOKENS
                    </div>
                    <AnimatedProgressBar
                        timeFrom={Number(campaign.config.startTimestamp) * 1000}
                        timeTo={(Number(campaign.config.startTimestamp) + campaign.config.period) * 1000}
                        now={Number(campaign.stats.currentTimestamp) * 1000}
                    />
                    <div>
                        <Countdown
                            zeroPadDays={2}
                            zeroPadTime={2}
                            date={
                                (Number(campaign.config.startTimestamp) +
                                    (campaign.config.period -
                                        (Number(campaign.stats.currentTimestamp) -
                                            Number(campaign.config.startTimestamp)))) *
                                1000
                            }
                            renderer={({ days, hours, minutes, seconds }) => (
                                <span className="tabular-nums">
                                    {days}d {hours.toString().padStart(2, '0')}h {minutes.toString().padStart(2, '0')}m{' '}
                                    {seconds.toString().padStart(2, '0')}s left
                                </span>
                            )}
                        />
                    </div>
                </div>
                <div className="border-l-2 border-[#ad925d] py-2 pl-4">🏁</div>
            </div>

            <StatsBoxTwoColumn.Wrapper className="w-full rounded-lg bg-dapp-blue-800 px-4 py-2 text-sm">
                <StatsBoxTwoColumn.LeftColumn>Total Rewards</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <span className="tabular-nums">
                        ~
                        {toReadableNumber(campaign.config.initialRewardAmount, rewardToken.decimals, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 3,
                        })}
                    </span>
                </StatsBoxTwoColumn.RightColumn>

                <StatsBoxTwoColumn.LeftColumn>Given Rewards</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <span className="tabular-nums">
                        ~
                        <NumberIncreaser
                            startNumber={
                                (campaign.config.initialRewardAmount *
                                    (BigInt(campaign.config.period) - campaign.stats.timeLeft)) /
                                BigInt(campaign.config.period)
                            }
                            endNumber={campaign.config.initialRewardAmount}
                            decimals={18n}
                            duration={BigInt(campaign.stats.timeLeft)}
                        />
                    </span>
                </StatsBoxTwoColumn.RightColumn>

                <StatsBoxTwoColumn.LeftColumn>Claimed Rewards</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <span className="tabular-nums">
                        ~
                        {toReadableNumber(
                            campaign.config.initialRewardAmount - campaign.config.rewardAmount,
                            rewardToken.decimals,
                            { minimumFractionDigits: 3, maximumFractionDigits: 3 }
                        )}
                    </span>
                </StatsBoxTwoColumn.RightColumn>

                <StatsBoxTwoColumn.LeftColumn>Staked {stakingToken.symbol}</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <span className="tabular-nums">
                        ~
                        {toReadableNumber(campaign.stats.staked, stakingToken.decimals, {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                        })}
                    </span>
                </StatsBoxTwoColumn.RightColumn>
                <div className="col-span-2">
                    <CaretDivider />
                </div>
                <StatsBoxTwoColumn.LeftColumn>Estimated APR</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <span className="tabular-nums">
                        ~
                        {toReadableNumber(campaign.stats.apr, 2, {
                            maximumFractionDigits: 3,
                            minimumFractionDigits: 3,
                        })}
                        %
                    </span>
                </StatsBoxTwoColumn.RightColumn>

                <StatsBoxTwoColumn.LeftColumn>Estimated APY</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <span className="line-clamp-1 tabular-nums">
                        ~
                        {toReadableNumber(
                            ((1 + Number(campaign.stats.apr) / 10000 / (365 / (campaign.config.period / 86400))) **
                                (365 / (campaign.config.period / 86400)) -
                                1) *
                                100,
                            0,
                            { maximumFractionDigits: 3 }
                        )}
                        %
                    </span>
                </StatsBoxTwoColumn.RightColumn>

                <div className="col-span-2">
                    <CaretDivider />
                </div>
                <div
                    className="col-span-2 flex flex-row items-center justify-end gap-2"
                    onClick={() => goToDetails(campaign)}
                >
                    Visit Campaign Site <IoMdOpen />
                </div>
            </StatsBoxTwoColumn.Wrapper>

            <div className="flex flex-row justify-start gap-2">
                <span className="rounded-lg bg-[#ad925d] px-3 py-1 font-bold text-[#665128]">running</span>
            </div>
        </Tile>
    )
}
