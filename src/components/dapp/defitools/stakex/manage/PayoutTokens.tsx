import { ManageStakeXContext } from '@dapphelpers/defitools'
import { toReadableNumber } from '@dapphelpers/number'
import { useGetChainExplorer } from '@dapphooks/shared/useGetChainExplorer'
import { useGetTargetTokens } from '@dapphooks/staking/useGetTargetTokens'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { Tile } from '@dappshared/Tile'
import { useContext } from 'react'
import { FaPlus, FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa'
import { IoMdOpen } from 'react-icons/io'
import { Button } from 'src/components/Button'
import { Spinner } from 'src/components/dapp/elements/Spinner'

export const PayoutTokens = () => {
    const {
        data: { protocol, chain },
    } = useContext(ManageStakeXContext)

    const { data: dataTargetTokens, isLoading: isLoadingTargetTokens } =
        useGetTargetTokens(protocol)

    const chainExplorer = useGetChainExplorer(chain!)

    return (
        <Tile className="w-full">
            <div className="flex flex-row items-center">
                <span className="flex-1 font-title text-xl font-bold">
                    Payout Tokens
                </span>
                <Button variant="primary" className="gap-3">
                    <FaPlus /> <span>Add</span>
                </Button>
            </div>
            {isLoadingTargetTokens ? (
                <div className="flex w-full flex-row justify-center pt-8">
                    <Spinner theme="dark" />
                </div>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                    {dataTargetTokens &&
                        dataTargetTokens.map((targetToken) => (
                            <div
                                key={targetToken.source}
                                className="flex flex-col gap-1 rounded-lg bg-dapp-blue-400 p-3"
                            >
                                <div className="flex items-center gap-2 text-xs ">
                                    <StatsBoxTwoColumn.Wrapper className="w-full text-sm">
                                        <StatsBoxTwoColumn.LeftColumn>
                                            <span className="font-bold">
                                                {targetToken.symbol}
                                            </span>
                                        </StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {chainExplorer && (
                                                <a
                                                    href={chainExplorer.getTokenUrl(
                                                        targetToken.source
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
                                            Paid out
                                        </StatsBoxTwoColumn.LeftColumn>
                                        <StatsBoxTwoColumn.RightColumn>
                                            {toReadableNumber(
                                                targetToken.rewarded,
                                                targetToken.decimals
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
                                                {targetToken.isTargetActive ? (
                                                    <FaRegCheckCircle className="h-5 w-5 text-success" />
                                                ) : (
                                                    <FaRegTimesCircle className="h-5 w-5 text-error" />
                                                )}
                                            </div>
                                        </StatsBoxTwoColumn.RightColumn>
                                    </StatsBoxTwoColumn.Wrapper>
                                </div>
                                <div className="mt-2">
                                    <Button
                                        variant="secondary"
                                        className=" w-full"
                                    >
                                        Set{' '}
                                        {targetToken.isTargetActive
                                            ? 'Inactive'
                                            : 'Active'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </Tile>
    )
}
