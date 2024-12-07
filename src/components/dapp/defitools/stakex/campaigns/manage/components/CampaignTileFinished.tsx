import { toReadableNumber } from '@dapphelpers/number'
import { CaretDivider } from '@dappshared/CaretDivider'
import { NumberIncreaser } from '@dappshared/NumberIncreaser'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { Tile } from '@dappshared/Tile'
import { CampaignData, TokenInfoResponse } from '@dapptypes'
import { IoMdOpen } from 'react-icons/io'
import { Button } from 'src/components/Button'

type CampaignTileFinishedProps = {
    campaign: CampaignData
    stakingToken: TokenInfoResponse
    rewardToken: TokenInfoResponse
    onClickRemoveStale: () => void
    goToDetails: (campaign: CampaignData) => void
}
export const CampaignTileFinished = ({
    campaign,
    rewardToken,
    stakingToken,
    onClickRemoveStale,
    goToDetails,
}: CampaignTileFinishedProps) => {
    return (
        <Tile className="flex flex-col gap-6">
            <div className="text-left font-bold">Campaign: {campaign.config.name}</div>
            <div className="flex flex-row items-center">
                <div className="border-r-2 border-[#4aad6b] py-2 pr-4">🚀</div>
                <div className="flex grow flex-col text-center text-sm font-bold">
                    <div>Campaign has ended</div>
                    <div className="relative h-2">
                        <div className="absolute h-2 w-full bg-[#4aad6b]"></div>
                    </div>
                    <div>&nbsp;</div>
                </div>
                <div className="border-l-2 border-[#4aad6b] py-2 pl-4">🏁</div>
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
                            { minimumFractionDigits: 0, maximumFractionDigits: 3 }
                        )}
                    </span>
                </StatsBoxTwoColumn.RightColumn>

                <StatsBoxTwoColumn.LeftColumn>Staked {stakingToken.symbol}</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <span className="tabular-nums">
                        ~
                        {toReadableNumber(campaign.stats.staked, stakingToken.decimals, {
                            minimumFractionDigits: 0,
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
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 3,
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

            <div className="flex flex-row items-center justify-end">
                <Button
                    variant="error"
                    onClick={onClickRemoveStale}
                    disabled={!campaign.stats.isStale}
                    className="w-auto"
                >
                    Remove Stale Campaigns
                </Button>
            </div>
        </Tile>
    )
}
