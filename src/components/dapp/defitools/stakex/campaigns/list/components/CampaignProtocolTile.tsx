import { Spinner } from '@dappelements/Spinner'
import { toReadableNumber } from '@dapphelpers/number'
import { useGetChainExplorer } from '@dapphooks/shared/useGetChainExplorer'
import { useCampaignsGetCampaignData } from '@dapphooks/staking/useCampaignsGetCampaignData'
import { usePeripheryGet } from '@dapphooks/staking/usePeripheryGet'
import { CaretDivider } from '@dappshared/CaretDivider'
import { StatsBoxTwoColumn } from '@dappshared/StatsBoxTwoColumn'
import { Tile } from '@dappshared/Tile'
import clsx from 'clsx'
import { toLower } from 'lodash'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { IoMdOpen } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'
import { getChainById } from 'shared/supportedChains'
import { CampaignResponse } from 'shared/types'
import { Button } from 'src/components/Button'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import logoSmall from './../../../../../../../images/degenx_logo_small_bg_pattern.png'

type CampaignProtocolTileProps = {
    campaignResponse: CampaignResponse
    chainId: number
}

export enum CampaignStatus {
    CREATED,
    OPENED,
    RUNNING,
    FINISHED,
}

export const CampaignProtocolTile = ({ campaignResponse }: CampaignProtocolTileProps) => {
    const { isConnected, address } = useAccount()

    ///
    /// Campaign Data
    ///
    const { data, isLoading } = useCampaignsGetCampaignData(
        campaignResponse.protocol! as Address,
        campaignResponse.chainId!,
        campaignResponse.bucketId as Address
    )

    ///
    /// Peripheral Data
    ///
    const { response: dataPeriphery } = usePeripheryGet(campaignResponse.protocol as Address, campaignResponse.chainId!)

    const chainExplorer = useGetChainExplorer(getChainById(campaignResponse.chainId!))

    const navigate = useNavigate()

    const [isCreated, setIsCreated] = useState(false)
    const [isOpened, setIsOpened] = useState(false)
    const [isRunning, setIsRunning] = useState(false)
    const [isFinished, setIsFinished] = useState(false)

    useEffect(() => {
        if (data) {
            setIsCreated(!data.stats.isOpen && !data.stats.isRunning && !data.stats.isFinished)
            setIsOpened(data.stats.isOpen)
            setIsRunning(data.stats.isRunning)
            setIsFinished(data.stats.isFinished)
        }
    }, [data])

    return !campaignResponse || isLoading ? (
        <Tile className="flex w-full flex-col items-center justify-center gap-4">
            <Spinner theme="dark" />
        </Tile>
    ) : (
        <div className="grid grid-cols-1 bg-dapp-blue-400 sm:rounded-lg sm:p-px">
            <Tile
                className={clsx([
                    'flex h-full w-full flex-col gap-6 bg-center !p-0',
                    dataPeriphery && dataPeriphery.data && dataPeriphery.data.heroBannerUrl && 'bg-cover bg-no-repeat',
                ])}
                style={{
                    backgroundImage:
                        dataPeriphery && dataPeriphery.data && dataPeriphery.data.heroBannerUrl
                            ? `linear-gradient(rgba(0,0,0, 0.7), rgba(0,0,0, 0.7)), radial-gradient(circle at center, #00000000 , #000000FF), url(${dataPeriphery.data.heroBannerUrl})`
                            : `linear-gradient(rgba(0,0,0, 0.7), rgba(0,0,0, 0.7)), radial-gradient(circle at center, #00000000 , #000000FF), url('${logoSmall.src}')`,
                }}
            >
                <div className="relative flex min-h-20 flex-row items-center gap-4 bg-dapp-blue-600/80 p-4 sm:rounded-t-lg">
                    {dataPeriphery && dataPeriphery.data && dataPeriphery.data.projectLogoUrl ? (
                        <span className="shrink-0 overflow-hidden rounded-full">
                            <Image src={dataPeriphery.data.projectLogoUrl} alt="Project Logo" width={50} height={50} />
                        </span>
                    ) : (
                        <span className="flex size-[50px] shrink-0 flex-row items-center justify-center overflow-hidden rounded-full bg-dapp-blue-400 text-xl font-bold">
                            {campaignResponse.stakingSymbol?.[0]}
                        </span>
                    )}
                    <Image
                        className="absolute left-12 top-12 rounded-full"
                        width={24}
                        height={24}
                        src={`/chains/${campaignResponse.chainId}.svg`}
                        alt={`Logo ${getChainById(campaignResponse.chainId!).nativeCurrency.symbol}`}
                    />
                    <span className="text-xl font-bold">{campaignResponse.name || 'Staking'}</span>
                </div>
                <div className="flex flex-col gap-4 p-4 pt-0 sm:p-8 sm:pt-0">
                    <StatsBoxTwoColumn.Wrapper className="gap-4">
                        <StatsBoxTwoColumn.LeftColumn>
                            <span className="text-base font-bold">Rewards</span>
                        </StatsBoxTwoColumn.LeftColumn>
                        <StatsBoxTwoColumn.RightColumn>
                            <span className="flex flex-row items-center justify-end gap-2 text-base font-bold tabular-nums">
                                <span>
                                    {toReadableNumber(
                                        campaignResponse.initialRewardAmount,
                                        campaignResponse.rewardDecimals,
                                        {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 3,
                                        }
                                    )}{' '}
                                    {campaignResponse.rewardSymbol}
                                </span>
                                {data && chainExplorer && (
                                    <a
                                        href={chainExplorer.getTokenUrl(data.stats.rewardToken.source)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex flex-row items-center justify-start"
                                    >
                                        <IoMdOpen />
                                    </a>
                                )}
                            </span>
                        </StatsBoxTwoColumn.RightColumn>

                        <StatsBoxTwoColumn.LeftColumn>
                            <span className="text-base font-bold">Duration</span>
                        </StatsBoxTwoColumn.LeftColumn>
                        <StatsBoxTwoColumn.RightColumn>
                            <span className="text-base font-bold tabular-nums">
                                {campaignResponse.period! / 86400} days
                            </span>
                        </StatsBoxTwoColumn.RightColumn>

                        <StatsBoxTwoColumn.LeftColumn>
                            <span className="text-base font-bold">Staking Token</span>
                        </StatsBoxTwoColumn.LeftColumn>
                        <StatsBoxTwoColumn.RightColumn>
                            <span className="flex flex-row items-center justify-end gap-2 text-base font-bold tabular-nums">
                                {campaignResponse.stakingSymbol}
                                {data && chainExplorer && (
                                    <a
                                        href={chainExplorer.getTokenUrl(data.stats.stakingToken.source)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex flex-row items-center justify-start"
                                    >
                                        <IoMdOpen />
                                    </a>
                                )}
                            </span>
                        </StatsBoxTwoColumn.RightColumn>

                        <StatsBoxTwoColumn.LeftColumn>
                            <span className="text-base font-bold">Status</span>
                        </StatsBoxTwoColumn.LeftColumn>
                        <StatsBoxTwoColumn.RightColumn>
                            <div className="flex h-full flex-row items-center justify-end">
                                <span
                                    className={clsx([
                                        'flex min-h-0 items-center gap-2 rounded-lg bg-opacity-30 px-2 py-1 font-display text-xs leading-3',
                                        isCreated && 'bg-[#adadad]',
                                        isOpened && 'bg-yellow/50',
                                        (isRunning || isFinished) && 'bg-[#4aad6b]',
                                    ])}
                                >
                                    <svg width={8} height={8} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                        <circle
                                            className={clsx([
                                                isCreated && 'fill-[#666666]',
                                                isOpened && 'fill-yellow',
                                                (isRunning || isFinished) && 'fill-[#2b653f]',
                                            ])}
                                            cx="50"
                                            cy="50"
                                            r="50"
                                        />
                                    </svg>
                                    <span className="text-dapp-cyan-50/80">
                                        {isCreated && 'upcoming'}
                                        {isOpened && 'open for deposit'}
                                        {isRunning && 'running'}
                                        {isFinished && 'finished'}
                                    </span>
                                </span>
                            </div>
                        </StatsBoxTwoColumn.RightColumn>

                        {isOpened && (
                            <>
                                <StatsBoxTwoColumn.LeftColumn>
                                    <span className="text-base font-bold">Current APY</span>
                                </StatsBoxTwoColumn.LeftColumn>
                                <StatsBoxTwoColumn.RightColumn>
                                    <span className="text-base font-bold">
                                        {data && data.stats.rewardToken.source == data.stats.stakingToken.source
                                            ? `${toReadableNumber(
                                                  ((1 +
                                                      Number(data?.stats.apr) /
                                                          10000 /
                                                          (365 / (data?.config.period / 86400))) **
                                                      (365 / (data?.config.period / 86400)) -
                                                      1) *
                                                      100,
                                                  0,
                                                  { maximumFractionDigits: 3 }
                                              )}%`
                                            : 'not available'}
                                    </span>
                                </StatsBoxTwoColumn.RightColumn>

                                <div className="col-span-2">
                                    <CaretDivider color="cyan" />
                                </div>

                                <StatsBoxTwoColumn.LeftColumn>
                                    <span>Staked {campaignResponse.stakingSymbol}</span>
                                </StatsBoxTwoColumn.LeftColumn>
                                <StatsBoxTwoColumn.RightColumn>
                                    <span className="tabular-nums">
                                        {toReadableNumber(
                                            data ? data.config.staked : 0,
                                            campaignResponse.stakingDecimals,
                                            {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 3,
                                            }
                                        )}
                                    </span>
                                </StatsBoxTwoColumn.RightColumn>
                            </>
                        )}
                    </StatsBoxTwoColumn.Wrapper>
                    <div className="flex flex-row gap-4">
                        <Button
                            onClick={() => {
                                navigate(
                                    `./details/${campaignResponse.chainId}/${campaignResponse.protocol}/${campaignResponse.bucketId}`,
                                    {
                                        relative: 'path',
                                    }
                                )
                            }}
                            variant="primary"
                            className="grow"
                        >
                            More Details
                        </Button>
                    </div>
                </div>
            </Tile>
        </div>
    )
}
