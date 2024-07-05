import { ManageStakeXContext } from '@dapphelpers/defitools'
import { toReadableNumber } from '@dapphelpers/number'
import { useGetChainExplorer } from '@dapphooks/shared/useGetChainExplorer'
import { useGetRewardTokens } from '@dapphooks/staking/useGetRewardTokens'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { Tile } from '@dappshared/Tile'
import { useContext } from 'react'
import { FaPlus, FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa'
import { IoMdOpen } from 'react-icons/io'
import { Button } from 'src/components/Button'
import { Spinner } from 'src/components/dapp/elements/Spinner'

export const RewardTokens = () => {
    const {
        data: { protocol, chain, stakingToken, isLoading, isOwner },
    } = useContext(ManageStakeXContext)

    const { data: dataRewardTokens, isLoading: isLoadingRewardTokens } =
        useGetRewardTokens(protocol)

    const chainExplorer = useGetChainExplorer(chain!)

    return (
        <Tile className="w-full">
            <div className="flex flex-row items-center">
                <span className="flex-1 font-title text-xl font-bold">
                    Reward Tokens
                </span>
                {isOwner && (
                    <Button variant="primary" className="gap-3">
                        <FaPlus /> <span>Add</span>
                    </Button>
                )}
            </div>
            {isLoadingRewardTokens ? (
                <div className="flex w-full flex-row justify-center pt-8">
                    <Spinner theme="dark" />
                </div>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                    {dataRewardTokens &&
                        dataRewardTokens.map((rewardToken) => (
                            <div
                                key={rewardToken.source}
                                className="flex flex-col gap-4"
                            >
                                <StatsBoxTwoColumn.Wrapper className="w-full rounded-lg bg-dapp-blue-800 px-5 py-2 text-sm">
                                    <StatsBoxTwoColumn.LeftColumn>
                                        <span className="font-bold">
                                            {rewardToken.symbol}
                                        </span>
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {chainExplorer && (
                                            <a
                                                href={chainExplorer.getTokenUrl(
                                                    rewardToken.source
                                                )}
                                                target="_blank"
                                                className="flex w-full flex-row items-center justify-end gap-1"
                                            >
                                                {chainExplorer.name}
                                                <IoMdOpen />
                                            </a>
                                        )}
                                    </StatsBoxTwoColumn.RightColumn>

                                    <div className="col-span-2">
                                        <CaretDivider />
                                    </div>

                                    <StatsBoxTwoColumn.LeftColumn>
                                        Injected
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        {toReadableNumber(
                                            rewardToken.injected,
                                            rewardToken.decimals
                                        )}
                                    </StatsBoxTwoColumn.RightColumn>

                                    <div className="col-span-2">
                                        <CaretDivider />
                                    </div>

                                    <StatsBoxTwoColumn.LeftColumn>
                                        Is active?
                                    </StatsBoxTwoColumn.LeftColumn>
                                    <StatsBoxTwoColumn.RightColumn>
                                        <div className="flex items-center justify-end">
                                            {rewardToken.isRewardActive ? (
                                                <FaRegCheckCircle className="h-5 w-5 text-success" />
                                            ) : (
                                                <FaRegTimesCircle className="h-5 w-5 text-error" />
                                            )}
                                        </div>
                                    </StatsBoxTwoColumn.RightColumn>
                                </StatsBoxTwoColumn.Wrapper>
                                {isOwner && (
                                    <div>
                                        <Button
                                            variant={`${
                                                rewardToken.isRewardActive
                                                    ? 'error'
                                                    : 'primary'
                                            }`}
                                            className="w-full"
                                        >
                                            Set{' '}
                                            {rewardToken.isRewardActive
                                                ? 'Inactive'
                                                : 'Active'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            )}
        </Tile>
    )
}
