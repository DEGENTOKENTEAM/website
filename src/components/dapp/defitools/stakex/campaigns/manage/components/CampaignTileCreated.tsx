import { toReadableNumber } from '@dapphelpers/number'
import { Tile } from '@dappshared/Tile'
import { CampaignData, TokenInfoResponse } from '@dapptypes'
import { FaPen } from 'react-icons/fa'
import { FaRegTrashCan } from 'react-icons/fa6'
import { Button } from 'src/components/Button'

type CampaignTileCreatedProps = {
    campaign: CampaignData
    rewardToken: TokenInfoResponse
    onClickDelete: (campaign: CampaignData) => void
    onClickEdit: (campaign: CampaignData) => void
    onClickOpen: (campaign: CampaignData) => void
}
export const CampaignTileCreated = ({
    campaign,
    rewardToken,
    onClickDelete,
    onClickEdit,
    onClickOpen,
}: CampaignTileCreatedProps) => {
    return (
        <Tile className="flex flex-col gap-6">
            <div className="text-left font-bold">Campaign: {campaign.config.name}</div>
            <div className="flex flex-row items-center">
                <div className="border-r-2 border-[#adadad] py-2 pr-4">🚀</div>
                <div className="flex grow flex-col text-center text-sm font-bold">
                    <div>
                        Reward{' '}
                        <span className="tabular-nums">
                            {toReadableNumber(campaign.config.initialRewardAmount, rewardToken.decimals)}
                        </span>{' '}
                        {rewardToken.symbol}
                    </div>
                    <div className="relative">
                        <div className="my-auto h-2 w-full bg-[#adadad]">&nbsp;</div>
                    </div>
                    <div>
                        in{' '}
                        <span className="tabular-nums">
                            {Number(campaign.config.period / 86400).toLocaleString(navigator.language, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 3,
                            })}
                        </span>{' '}
                        days
                    </div>
                </div>
                <div className="border-l-2 border-[#adadad] py-2 pl-4">🏁</div>
            </div>
            <div className="flex flex-row items-center gap-2">
                <span className="rounded-lg bg-[#adadad] px-3 py-1 font-bold text-[#666666]">created</span>
                <span className="grow"></span>
                <Button variant="error" onClick={() => onClickDelete(campaign)} className="w-auto">
                    &nbsp;
                    <FaRegTrashCan className="size-4" />
                    &nbsp;
                </Button>
                <Button variant="primary" onClick={() => onClickEdit(campaign)} className="w-auto">
                    &nbsp;
                    <FaPen className="size-4" />
                    &nbsp;
                </Button>
                <Button variant="primary" onClick={() => onClickOpen(campaign)} className="w-auto">
                    Open Campaign
                </Button>
            </div>
        </Tile>
    )
}
