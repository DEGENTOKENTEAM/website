import { toReadableNumber } from '@dapphelpers/number'
import { usePeripheryGet } from '@dapphooks/staking/usePeripheryGet'
import { Tile } from '@dappshared/Tile'
import clsx from 'clsx'
import Image from 'next/image'
import { FaInfoCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { getChainById } from 'shared/supportedChains'
import { ProtocolsResponse } from 'shared/types'
import { Button } from 'src/components/Button'
import { Address } from 'viem'
import logoSmall from './../../../../../images/degenx_logo_small_bg_pattern.png'
import { Tooltip } from 'flowbite-react'

type RegularProtocolTileProps = {
    protocolResponse: ProtocolsResponse
}

export const RegularProtocolTile = ({ protocolResponse }: RegularProtocolTileProps) => {
    const navigate = useNavigate()
    const { protocol, token } = protocolResponse
    const { response: dataPeriphery } = usePeripheryGet(protocol.source as Address, protocol.chainId)
    return (
        <div className="bg-dapp-blue-400 text-base sm:rounded-lg sm:p-px">
            <Tile
                className={clsx([
                    'flex h-full w-full flex-col gap-6 bg-center !p-0',
                    dataPeriphery && dataPeriphery.data && dataPeriphery.data.heroBannerUrl && 'bg-cover  bg-no-repeat',
                ])}
                style={{
                    backgroundImage:
                        dataPeriphery && dataPeriphery.data && dataPeriphery.data.heroBannerUrl
                            ? `linear-gradient(rgba(0,0,0, 0.7), rgba(0,0,0, 0.7)), radial-gradient(circle at center, #00000055 , #000000FF), url(${dataPeriphery.data.heroBannerUrl})`
                            : `linear-gradient(rgba(0,0,0, 0.7), rgba(0,0,0, 0.7)), radial-gradient(circle at center, #00000055 , #000000FF), url('${logoSmall.src}')`,
                }}
            >
                <div className="relative flex min-h-20 flex-row items-center gap-4 bg-dapp-blue-600/80 p-4 sm:rounded-t-lg">
                    {dataPeriphery && dataPeriphery.data && dataPeriphery.data.projectLogoUrl ? (
                        <span className="shrink-0 overflow-hidden rounded-full">
                            <Image src={dataPeriphery.data.projectLogoUrl} alt="Project Logo" width={50} height={50} />
                        </span>
                    ) : (
                        <span className="flex size-[50px] shrink-0 flex-row items-center justify-center overflow-hidden rounded-full bg-dapp-blue-400 text-xl font-bold">
                            {token && token.symbol ? token.symbol[0] : ''}
                        </span>
                    )}
                    <Image
                        className="absolute left-12 top-12 rounded-full"
                        width={24}
                        height={24}
                        src={`/chains/${protocol.chainId}.svg`}
                        alt={`Logo ${getChainById(protocol.chainId).nativeCurrency.symbol}`}
                    />
                    <span className="text-xl font-bold">{protocol.name || 'Staking'}</span>
                </div>

                <div className="flex flex-col gap-4 px-4 pb-4 sm:px-8 sm:pb-8">
                    <div>
                        <span className="mr-2 font-bold">Stake</span> {token.symbol}
                    </div>
                    <div>
                        <span className="mr-2 font-bold">Earn</span>{' '}
                        {protocol.rewards && protocol.rewards.length
                            ? protocol.rewards.map((token, i) => (i > 0 ? ` + ${token.symbol}` : token.symbol))
                            : 'tbd'}
                    </div>

                    <div>
                        <span className="mr-2 font-bold">APR</span>
                        <span className="tabular-nums">
                            {protocol.apy >= 0
                                ? `${toReadableNumber(protocol.apr, 0, {
                                      maximumFractionDigits: 3,
                                      minimumFractionDigits: 2,
                                  })}%`
                                : `pretty high`}
                        </span>
                    </div>

                    <div>
                        <span className="mr-2 font-bold">APY</span>{' '}
                        <span className="tabular-nums">
                            {protocol.apy >= 0
                                ? `${toReadableNumber(protocol.apy, 0, {
                                      maximumFractionDigits: 3,
                                      minimumFractionDigits: 2,
                                  })}%`
                                : `pretty high`}
                        </span>
                    </div>

                    <div className="flex flex-row items-center gap-2">
                        <span className="font-bold">Staked</span>{' '}
                        <span className="tabular-nums">
                            {toReadableNumber(protocol.stakedAbs, token.decimals, {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 2,
                            })}
                        </span>
                        <Tooltip
                            content={`${toReadableNumber(protocol.stakedRel, 0, {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 2,
                            })}% of total supply`}
                        >
                            <FaInfoCircle />
                        </Tooltip>
                    </div>

                    <div>
                        <span className="mr-2 font-bold">Stakers</span>{' '}
                        <span className="tabular-nums">{protocol.stakes}</span>
                    </div>

                    <Button
                        className="w-full"
                        onClick={() => {
                            navigate(`/dapp/staking/${protocol.chainId}/${protocol.source}`, { relative: 'path' })
                        }}
                        variant="primary"
                    >
                        More Details
                    </Button>
                </div>
            </Tile>
        </div>
    )
}
