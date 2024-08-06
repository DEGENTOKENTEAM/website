import { visualAddress } from '@dapphelpers/address'
import { ManageStakeXContext } from '@dapphelpers/defitools'
import { toReadableNumber } from '@dapphelpers/number'
import { useFetch } from '@dapphooks/shared/useFetch'
import { useGetChainExplorer } from '@dapphooks/shared/useGetChainExplorer'
import { useGetERC20BalanceOf } from '@dapphooks/shared/useGetERC20BalanceOf'
import { useActive } from '@dapphooks/staking/useActive'
import { useGetStableToken } from '@dapphooks/staking/useGetStableToken'
import { useGetStakingData } from '@dapphooks/staking/useGetStakingData'
import { useGetStakingToken } from '@dapphooks/staking/useGetStakingToken'
import { useGetTVLinUSD } from '@dapphooks/staking/useGetTVLinUSD'
import { useInitialized } from '@dapphooks/staking/useInitialized'
import { useRunning } from '@dapphooks/staking/useRunning'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { Tile } from '@dappshared/Tile'
import { isUndefined } from 'lodash'
import { useContext, useEffect, useState } from 'react'
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa'
import { IoMdOpen } from 'react-icons/io'
import { Spinner } from 'src/components/dapp/elements/Spinner'

export const GeneralInformation = () => {
    const {
        data: { chain, protocol, owner },
    } = useContext(ManageStakeXContext)

    const [tvlUsd, setTvlUsd] = useState(0)

    const { data: dataStakingToken, isLoading: isLoadingStakingToken } =
        useGetStakingToken(protocol, chain?.id!)
    const { data: dataStableToken, isLoading: isLoadingStableToken } =
        useGetStableToken(protocol, chain?.id!)
    const { data: dataIsActive, isLoading: isLoadingIsActive } = useActive(
        protocol,
        chain?.id!
    )
    const { data: dataIsInitialized, isLoading: isLoadingIsInitialized } =
        useInitialized(protocol, chain?.id!)
    const { data: dataIsRunning, isLoading: isLoadingIsRunning } = useRunning(
        protocol,
        chain?.id!
    )
    const { data: dataStakingData } = useGetStakingData(protocol, chain?.id!)
    const {
        data: dataStakingTokenBalance,
        isLoading: isLoadingStakingTokenBalance,
    } = useGetERC20BalanceOf(dataStakingToken?.source!, protocol, chain?.id!)

    const chainExplorer = useGetChainExplorer(chain!)

    /// get dollar price per token
    const { response: responseStakingTokenInfo } = useFetch({
        enabled: Boolean(dataStakingToken?.source),
        url: `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/latest/dex/tokens/${dataStakingToken?.source}`,
    })
    const { response: responseTVLinUSD } = useGetTVLinUSD(protocol, chain?.id!)

    useEffect(() => {
        if (
            Boolean(
                responseStakingTokenInfo &&
                    responseStakingTokenInfo.pairs &&
                    responseStakingTokenInfo.pairs.length > 0 &&
                    dataStakingData &&
                    dataStakingToken
            )
        ) {
            const avgUsd =
                responseStakingTokenInfo.pairs.reduce(
                    (acc: number, pair: any) => acc + Number(pair.priceUsd),
                    0
                ) / responseStakingTokenInfo.pairs.length

            setTvlUsd(
                avgUsd *
                    (Number(dataStakingData!.staked.amount) /
                        10 **
                            Number(dataStakingData!.staked.tokenInfo.decimals))
            )
        }
    }, [responseStakingTokenInfo, dataStakingData, dataStakingToken])

    useEffect(() => {
        if (dataStakingData) {
            const fetches: any[] = []
            for (const reward of dataStakingData.rewarded) {
                fetches.push({
                    url: `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/latest/dex/tokens/${reward.tokenInfo.source}`,
                })
            }
        }
    }, [dataStakingData])

    return (
        <Tile className="flex w-full flex-col gap-8">
            <span className="flex-1 font-title text-xl font-bold">
                General Information
            </span>
            <StatsBoxTwoColumn.Wrapper className="w-full rounded-lg bg-dapp-blue-800 px-5 py-2 text-sm">
                <div className="col-span-2">
                    <span className="font-bold">Protocol address</span>
                    <br />
                    <span className="flex flex-row items-center gap-2 font-mono text-sm">
                        <span className=" xs:hidden">
                            {visualAddress(protocol, 8)}
                        </span>
                        <span className="hidden text-xs xs:inline sm:text-sm">
                            {protocol}
                        </span>
                        {chainExplorer && dataStakingToken && (
                            <a
                                href={chainExplorer.getAddressUrl(protocol)}
                                target="_blank"
                                className="flex flex-row items-center justify-start"
                            >
                                <IoMdOpen />
                            </a>
                        )}
                    </span>
                </div>
                <div className="col-span-2 mt-4">
                    <span className="font-bold">Owner address</span>
                    <br />
                    <span className="flex flex-row items-center gap-2 font-mono text-sm">
                        <span className=" xs:hidden">
                            {owner && visualAddress(owner, 8)}
                        </span>
                        <span className="hidden text-xs xs:inline sm:text-sm">
                            {owner}
                        </span>
                        {chainExplorer && dataStakingToken && (
                            <a
                                href={chainExplorer.getAddressUrl(owner)}
                                target="_blank"
                                className="flex flex-row items-center justify-start"
                            >
                                <IoMdOpen />
                            </a>
                        )}
                    </span>
                </div>
                <div className="col-span-2 mt-4">
                    <span className="font-bold">Staking token address</span>
                    <br />
                    <span className="flex flex-row items-center gap-2 font-mono text-sm">
                        <span className="xs:hidden">
                            {dataStakingToken &&
                                visualAddress(dataStakingToken.source, 8)}
                        </span>
                        <span className="hidden text-xs xs:inline sm:text-sm">
                            {dataStakingToken && dataStakingToken.source}
                        </span>
                        {chainExplorer && dataStakingToken && (
                            <a
                                href={chainExplorer.getTokenUrl(
                                    dataStakingToken.source
                                )}
                                target="_blank"
                                className="flex flex-row items-center justify-start"
                            >
                                <IoMdOpen />
                            </a>
                        )}
                    </span>
                </div>

                <div className="col-span-2">
                    <CaretDivider />
                </div>

                <StatsBoxTwoColumn.LeftColumn>
                    Staked {dataStakingToken && dataStakingToken.symbol}
                </StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <div className="flex justify-end">
                        {!isLoadingStakingTokenBalance &&
                        !isUndefined(dataStakingTokenBalance) &&
                        dataStakingToken ? (
                            `${
                                dataStakingTokenBalance ? '~' : ''
                            }${toReadableNumber(
                                dataStakingTokenBalance,
                                dataStakingToken.decimals,
                                {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2,
                                }
                            )}`
                        ) : (
                            <Spinner className="mt-2 h-2 w-2" theme="dark" />
                        )}
                    </div>
                </StatsBoxTwoColumn.RightColumn>

                {!isLoadingStableToken && dataStableToken && tvlUsd && (
                    <>
                        <StatsBoxTwoColumn.LeftColumn>
                            Total Value Locked
                        </StatsBoxTwoColumn.LeftColumn>
                        <StatsBoxTwoColumn.RightColumn>
                            <div className="flex justify-end">
                                ~$
                                {toReadableNumber(responseTVLinUSD, 0, {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2,
                                })}
                            </div>
                        </StatsBoxTwoColumn.RightColumn>
                    </>
                )}

                <div className="col-span-2">
                    <CaretDivider />
                </div>

                <StatsBoxTwoColumn.LeftColumn>
                    Protocol initialized?
                </StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <div className="flex justify-end">
                        {!isLoadingIsInitialized ? (
                            dataIsInitialized ? (
                                <FaRegCheckCircle className="h-5 w-5 text-success" />
                            ) : (
                                <FaRegTimesCircle className="h-5 w-5 text-error" />
                            )
                        ) : (
                            <Spinner className="mt-2 h-2 w-2" theme="dark" />
                        )}
                    </div>
                </StatsBoxTwoColumn.RightColumn>

                <StatsBoxTwoColumn.LeftColumn>
                    Protocol active?
                </StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <div className="flex justify-end">
                        {!isLoadingIsActive ? (
                            dataIsActive ? (
                                <FaRegCheckCircle className="h-5 w-5 text-success" />
                            ) : (
                                <FaRegTimesCircle className="h-5 w-5 text-error" />
                            )
                        ) : (
                            <Spinner className="mt-2 h-2 w-2" theme="dark" />
                        )}
                    </div>
                </StatsBoxTwoColumn.RightColumn>

                <StatsBoxTwoColumn.LeftColumn>
                    Protocol running?
                </StatsBoxTwoColumn.LeftColumn>
                <StatsBoxTwoColumn.RightColumn>
                    <div className="flex justify-end">
                        {!isLoadingIsRunning ? (
                            dataIsRunning ? (
                                <FaRegCheckCircle className="h-5 w-5 text-success" />
                            ) : (
                                <FaRegTimesCircle className="h-5 w-5 text-error" />
                            )
                        ) : (
                            <Spinner className="mt-2 h-2 w-2" theme="dark" />
                        )}
                    </div>
                </StatsBoxTwoColumn.RightColumn>
            </StatsBoxTwoColumn.Wrapper>

            {/* 
            <p>APY (Token and Reward assets)</p>
            <p>
                If it's not started yet and no option set, provide start
                functions (Instant, By Block, By Time)
            </p>
            <p>
                Deposit function Link (extra area which is also reachable from
                STAKEX protocol)
            </p> */}
        </Tile>
    )
}
