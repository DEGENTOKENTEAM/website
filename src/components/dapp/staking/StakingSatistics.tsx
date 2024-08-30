import { toReadableNumber } from '@dapphelpers/number'
import { durationFromSeconds, StakeXContext } from '@dapphelpers/staking'
import { useGetStakingData } from '@dapphooks/staking/useGetStakingData'
import { useGetTVLinUSD } from '@dapphooks/staking/useGetTVLinUSD'
import { Tile } from '@dappshared/Tile'
import { useContext } from 'react'
import { Address } from 'viem'
import { Spinner } from '../elements/Spinner'

type StakingStatisticsProps = {
    protocol: Address
    chainId: number
    children?: any
}
export const StakingStatistics = ({ protocol, chainId }: StakingStatisticsProps) => {
    const {
        data: { isActive },
    } = useContext(StakeXContext)

    const { data: stakingData, isLoading } = useGetStakingData(protocol, chainId)

    const { response: responseTVLinUSD, loading: loadingTVLinUSD } = useGetTVLinUSD(protocol, chainId)

    return (
        <Tile className="w-full max-w-2xl text-lg leading-6">
            <h1 className="mb-5 flex flex-row items-center gap-2 px-1">
                <span className="flex-1 font-title text-xl font-bold">General Information</span>
                <span
                    className={`flex h-full min-h-0 items-center gap-2 rounded-lg bg-opacity-30 px-2 py-1 font-display text-xs leading-3 ${
                        isActive ? 'bg-success' : 'bg-error'
                    }`}
                >
                    <svg width={8} height={8} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle className={isActive ? 'fill-success' : 'fill-error'} cx="50" cy="50" r="50" />
                    </svg>
                    <span className="text-dapp-cyan-50 text-opacity-60">{isActive ? 'Online' : 'Offline'}</span>
                </span>
            </h1>
            {isLoading && (
                <div className="flex justify-center p-5">
                    <Spinner theme="dark" />
                </div>
            )}
            {!isLoading && stakingData && (
                <div className="grid grid-cols-6 gap-y-1 rounded-lg bg-dapp-blue-800 p-5 sm:gap-y-6">
                    <div className="col-span-3 text-left sm:col-span-2">
                        <span className="text-xs text-darkTextLowEmphasis">
                            Locked {stakingData.staked.tokenInfo.symbol}
                        </span>
                        <br />
                        {toReadableNumber(stakingData.staked.amount, stakingData.staked.tokenInfo.decimals)}
                    </div>
                    <div className="col-span-3 flex flex-col justify-center gap-y-1 text-right sm:col-span-2 sm:text-center">
                        <span className="text-xs text-darkTextLowEmphasis">
                            Locked {stakingData.staked.tokenInfo.symbol} in $
                        </span>
                        {loadingTVLinUSD ? (
                            <Spinner theme="dark" className="!h-4 !w-4" />
                        ) : (
                            <span>{toReadableNumber(responseTVLinUSD)}</span>
                        )}
                    </div>
                    <div className="col-span-3 text-left sm:col-span-2 sm:text-right">
                        <span className="text-xs text-darkTextLowEmphasis">
                            % of Locked {stakingData.staked.tokenInfo.symbol}
                        </span>
                        <br />
                        {((Number(stakingData.staked.amount) / Number(stakingData.totalSupply)) * 100).toLocaleString(
                            navigator.language,
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}
                    </div>
                    <div className="col-span-3 text-right sm:col-span-3 sm:text-left">
                        <span className="text-xs text-darkTextLowEmphasis">Total Stakes</span>
                        <br />
                        {stakingData.stakes.toString()}
                    </div>
                    <div className="col-span-3 text-left sm:col-span-3 sm:text-right">
                        <span className="text-xs text-darkTextLowEmphasis">Total Stakes Burned</span>
                        <br />
                        {stakingData.stakesBurned.toString()}
                    </div>
                    <div className="col-span-3 text-right sm:col-span-3 sm:text-left">
                        <span className="text-xs text-darkTextLowEmphasis">
                            Total {stakingData.stakedBurned.tokenInfo.symbol} Burned
                        </span>
                        <br />
                        {toReadableNumber(stakingData.stakedBurned.amount, stakingData.stakedBurned.tokenInfo.decimals)}
                    </div>
                    <div className="col-span-6 text-center sm:col-span-3 sm:text-right">
                        <span className="text-xs text-darkTextLowEmphasis">Average Lock Period</span>
                        <br />
                        {stakingData.stakes > 0
                            ? stakingData.avgLock > 0
                                ? durationFromSeconds(parseInt(stakingData.avgLock.toString()), {
                                      long: true,
                                      format: 'in-days',
                                  })
                                : 'only infinite'
                            : 'no stakes'}
                    </div>
                </div>
            )}
        </Tile>
    )
}
