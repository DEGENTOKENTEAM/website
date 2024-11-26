import { toReadableNumber } from '@dapphelpers/number'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { Tile } from '@dappshared/Tile'
import { CampaignData, TokenInfoResponse } from '@dapptypes'
import { Tooltip } from 'flowbite-react'
import { FaRegTrashCan } from 'react-icons/fa6'
import { IoMdOpen } from 'react-icons/io'
import { Button } from 'src/components/Button'

type CampaignTileOpenedProps = {
    campaign: CampaignData
    stakingToken: TokenInfoResponse
    rewardToken: TokenInfoResponse
    onClickDelete: (campaign: CampaignData) => void
    onClickStart: (campaign: CampaignData) => void
    goToDetails: (campaign: CampaignData) => void
}
export const CampaignTileOpened = ({
    campaign,
    stakingToken,
    rewardToken,
    onClickDelete,
    onClickStart,
    goToDetails,
}: CampaignTileOpenedProps) => {
    return (
        <Tile className="flex flex-col gap-6">
            <div className="text-left font-bold">Campaign: {campaign.config.name}</div>
            <div className="flex flex-row items-center">
                <div className="border-r-2 border-[#7c95ad] py-2 pr-4">🚀</div>
                <div className="flex grow flex-col text-center text-sm font-bold">
                    <div>
                        Reward{' '}
                        <span className="tabular-nums">
                            ~
                            {toReadableNumber(campaign.config.rewardAmount, rewardToken.decimals, {
                                minimumFractionDigits: 0,
                            })}
                        </span>{' '}
                        {rewardToken.symbol}
                    </div>
                    <div className="relative">
                        <div className="my-auto h-2 w-full bg-[#7c95ad]">&nbsp;</div>
                    </div>
                    <div>
                        in <span className="tabular-nums">{campaign.config.period / 86400}</span> days
                    </div>
                </div>
                <div className="border-l-2 border-[#7c95ad] py-2 pl-4">🏁</div>
            </div>

            <StatsBoxTwoColumn.Wrapper className="w-full rounded-lg bg-dapp-blue-800 px-4 py-2 text-sm">
                <StatsBoxTwoColumn.LeftColumn>Staked {stakingToken.symbol}</StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <span className="tabular-nums">
                        ~
                        {toReadableNumber(campaign.stats.staked, stakingToken.decimals, {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
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
                    <span className="tabular-nums">
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

            <div className="flex flex-row items-center gap-2">
                <span className="rounded-lg bg-[#7c95ad] px-3 py-1 font-bold text-[#415966]">opened</span>
                <span className="grow"></span>
                <Button
                    variant="error"
                    disabled={campaign.stats.staked > 0n}
                    onClick={() => onClickDelete(campaign)}
                    className="w-auto"
                >
                    &nbsp;
                    <FaRegTrashCan className="size-4" />
                    &nbsp;
                </Button>
                <Button
                    variant="primary"
                    onClick={() => onClickStart(campaign)}
                    disabled={campaign.stats.staked == 0n}
                    className="w-auto"
                >
                    🚀 Start Campaign
                </Button>
            </div>
        </Tile>
    )
}
