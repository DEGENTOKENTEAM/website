import { toReadableNumber } from '@dapphelpers/number'
import { usePeripheryGet } from '@dapphooks/staking/usePeripheryGet'
import { Tile } from '@dappshared/Tile'
import clsx from 'clsx'
import Image from 'next/image'
import { useNavigate } from 'react-router-dom'
import { getChainById } from 'shared/supportedChains'
import { ProtocolsResponse } from 'shared/types'
import { Button } from 'src/components/Button'
import { Address } from 'viem'
import logoSmall from './../../../../../images/degenx_logo_small_bg_pattern.png'

type RegularProtocolTileProps = {
    protocolResponse: ProtocolsResponse
}

export const RegularProtocolTile = ({ protocolResponse }: RegularProtocolTileProps) => {
    const navigate = useNavigate()
    const { protocol, token } = protocolResponse
    const { response: dataPeriphery } = usePeripheryGet(protocol.source as Address, protocol.chainId)
    return (
        <div className="bg-dapp-blue-400 sm:rounded-lg sm:p-px">
            <Tile
                className={clsx([
                    'flex w-full flex-col gap-6 bg-center !p-0',
                    dataPeriphery && dataPeriphery.data && dataPeriphery.data.heroBannerUrl && 'bg-cover  bg-no-repeat',
                ])}
                style={{
                    backgroundImage:
                        dataPeriphery && dataPeriphery.data && dataPeriphery.data.heroBannerUrl
                            ? `linear-gradient(rgba(0,0,0, 0.7), rgba(0,0,0, 0.7)), radial-gradient(circle at center, #00000000 , #000000FF), url(${dataPeriphery.data.heroBannerUrl})`
                            : `linear-gradient(rgba(0,0,0, 0.7), rgba(0,0,0, 0.7)), radial-gradient(circle at center, #00000000 , #000000FF), url('${logoSmall.src}')`,
                }}
            >
                <div className="min-h-20 flex flex-row items-center gap-4 bg-dapp-blue-600/80 p-4 sm:rounded-t-lg">
                    {dataPeriphery && dataPeriphery.data && dataPeriphery.data.projectLogoUrl ? (
                        <span className="shrink-0 overflow-hidden rounded-full">
                            <Image src={dataPeriphery.data.projectLogoUrl} alt="Project Logo" width={50} height={50} />
                        </span>
                    ) : (
                        <span className="size-[50px] flex shrink-0 flex-row items-center justify-center overflow-hidden rounded-full bg-dapp-blue-400 text-xl font-bold">
                            {token && token.symbol ? token.symbol[0] : ''}
                        </span>
                    )}
                    <span className="text-xl font-bold">{protocol.name || 'Staking'}</span>
                </div>

                <div className="flex flex-col gap-4 px-4 pb-4 sm:px-8 sm:pb-8">
                    <div>
                        <span className="mr-2 font-bold">Token</span> {token.symbol}
                    </div>

                    <div>
                        <span className="mr-2 font-bold">Staked</span>{' '}
                        {toReadableNumber(protocol.stakedAbs, token.decimals, {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                        })}{' '}
                        (
                        {toReadableNumber(protocol.stakedRel, 0, {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                        })}
                        % of total supply)
                    </div>

                    <div>
                        <span className="mr-2 font-bold">Stakers</span> {protocol.stakes}
                    </div>

                    <div>
                        <span className="mr-2 font-bold">APR</span>{' '}
                        {toReadableNumber(protocol.apr, 0, {
                            maximumFractionDigits: 3,
                            minimumFractionDigits: 2,
                        })}
                        %
                    </div>

                    <div>
                        <span className="mr-2 font-bold">APY</span>{' '}
                        {protocol.apy < 0
                            ? `pretty high`
                            : `${toReadableNumber(protocol.apy, 0, {
                                  maximumFractionDigits: 3,
                                  minimumFractionDigits: 2,
                              })}%`}
                    </div>

                    <div>
                        <span className="mr-2 font-bold">Network</span> {getChainById(protocol.chainId).name} (ID:{' '}
                        {protocol.chainId})
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
