'use client'
import clsx from 'clsx'
import { visualAddress } from '../../helpers/address'
import { useFeeConfigs } from '../../hooks/multi-chain/useFeeConfigs'
import { FeeConfigState } from '../../types'

const FeeConfigStateDot = (props: { syncState: FeeConfigState }) => {
    const color = clsx({
        'fill-red-500': props.syncState === FeeConfigState.UPDATED,
        'fill-blue-500': props.syncState === FeeConfigState.NEW,
        'fill-yellow': props.syncState === FeeConfigState.SYNC,
        'fill-green-500': props.syncState === FeeConfigState.DEPLOYED,
    })
    return (
        <svg
            className={color + ' inline-block'}
            width="40px"
            height="40px"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M7.8 10a2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0-4.4 0z" />
        </svg>
    )
}

export const Monitoring = () => {
    const data = useFeeConfigs()
    console.log({ data })
    const deploymentStatusMap = (status: number) => {
        switch (status) {
            case 1:
                return FeeConfigState.UPDATED
            case 2:
                return FeeConfigState.SYNC
            case 3:
                return FeeConfigState.DEPLOYED
            default:
                return FeeConfigState.NEW
        }
    }

    return (
        <div className="grid grid-cols-1 gap-8 md:gap-24">
            <h1 className="mb-5 mt-4 flex flex-col gap-1 font-title text-3xl font-bold tracking-wide sm:mb-8 sm:flex-row">
                <span className="text-techGreen">DEGENX</span>
                <span className="text-degenOrange">MONITORING</span>
            </h1>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-0">
                <div className="text-center">
                    <h2 className="mb-5 text-2xl font-bold">Avalanche</h2>
                    <svg
                        className="max-w-48 inline-block w-48 fill-activeblue"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 253"
                        enable-background="new 0 0 256 253"
                    >
                        <path
                            d="M102.416,148.646l-8.293-21.305l0.027-0.031h26.819L102.416,148.646z M90.278,131.592l-14.922,17.16h21.602L90.278,131.592z
	 M109.2,148.752h37.599l-18.644-21.441h-0.31L109.2,148.752z M161.968,127.447l-0.118-0.136h-26.821l18.624,21.418L161.968,127.447z
	 M180.644,148.752l-14.833-17.057l-6.664,17.057H180.644z M157.121,154.112l-22.96,58.768l46.616-58.768H157.121z M75.223,154.112
	l46.646,58.81l-22.892-58.81H75.223z M127.973,214.311l23.579-60.199h-47.009L127.973,214.311z M2,69
	c0,13.678,9.625,25.302,22,29.576V233H2v18h252v-18h-22V98.554c12.89-3.945,21.699-15.396,22-29.554v-8H2V69z M65.29,68.346
	c0,6.477,6.755,31.47,31.727,31.47c21.689,0,31.202-19.615,31.202-31.47c0,11.052,7.41,31.447,31.464,31.447
	c21.733,0,31.363-20.999,31.363-31.447c0,14.425,9.726,26.416,22.954,30.154V233H42V98.594C55.402,94.966,65.29,82.895,65.29,68.346
	z M222.832,22H223V2H34v20L2,54h252L222.832,22z"
                        />
                    </svg>
                    <div className="mt-4 text-center">
                        <p className="font-bold">DGNX Supply</p>
                        <p className="text-xl">
                            {parseInt(
                                (
                                    (data?.totalSupplyAvalancheNet || 0n) /
                                    10n ** 18n
                                ).toString()
                            ).toLocaleString(navigator.language)}
                        </p>
                    </div>
                </div>
                <div></div>
                <div className="text-center">
                    <h2 className="mb-5 text-2xl font-bold">Ethereum</h2>
                    <svg
                        className="max-w-48 inline-block w-48 fill-activeblue"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 253"
                        enable-background="new 0 0 256 253"
                    >
                        <path
                            d="M102.416,148.646l-8.293-21.305l0.027-0.031h26.819L102.416,148.646z M90.278,131.592l-14.922,17.16h21.602L90.278,131.592z
	 M109.2,148.752h37.599l-18.644-21.441h-0.31L109.2,148.752z M161.968,127.447l-0.118-0.136h-26.821l18.624,21.418L161.968,127.447z
	 M180.644,148.752l-14.833-17.057l-6.664,17.057H180.644z M157.121,154.112l-22.96,58.768l46.616-58.768H157.121z M75.223,154.112
	l46.646,58.81l-22.892-58.81H75.223z M127.973,214.311l23.579-60.199h-47.009L127.973,214.311z M2,69
	c0,13.678,9.625,25.302,22,29.576V233H2v18h252v-18h-22V98.554c12.89-3.945,21.699-15.396,22-29.554v-8H2V69z M65.29,68.346
	c0,6.477,6.755,31.47,31.727,31.47c21.689,0,31.202-19.615,31.202-31.47c0,11.052,7.41,31.447,31.464,31.447
	c21.733,0,31.363-20.999,31.363-31.447c0,14.425,9.726,26.416,22.954,30.154V233H42V98.594C55.402,94.966,65.29,82.895,65.29,68.346
	z M222.832,22H223V2H34v20L2,54h252L222.832,22z"
                        />
                    </svg>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p className="font-bold">DGNX Supply</p>
                            <p className="text-xl">
                                {parseInt(
                                    (
                                        (data?.totalSupplyEthereum || 0n) /
                                        10n ** 18n
                                    ).toString()
                                ).toLocaleString(navigator.language)}
                            </p>
                        </div>
                        <div>
                            <p className="font-bold">Fees Collected</p>
                            <p className="text-xl">
                                {parseInt(
                                    (
                                        (data?.collectedFeesTotalEthereum ||
                                            0n) /
                                        10n ** 18n
                                    ).toString()
                                ).toLocaleString(navigator.language)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h2 className="mt-4 flex flex-col gap-1 font-title text-xl font-bold tracking-wide sm:mb-8 sm:flex-row">
                    <span className="text-techGreen">FEE</span>
                    <span className="text-degenOrange">CONFIGURATIONS</span>
                </h2>
                <div className="xs:grid-cols-2 mt-10 grid grid-cols-1 gap-4  sm:grid-cols-2 md:grid-cols-4 ">
                    {data?.feeConfigs?.map((feeConfig: any) => (
                        <div className="rounded-lg border-2 border-solid border-activeblue bg-gradient-to-bl from-darkerblue to-darkblue">
                            <p className="p-4">
                                <span className="font-bold">Fee ID</span>
                                <br />
                                {(feeConfig.id as string).slice(0, 10)}
                                ...
                                {(feeConfig.id as string).slice(-8)}
                            </p>
                            <p className="border-t border-dashed border-activeblue p-4">
                                <span className="font-bold">% Fee (bps)</span>
                                <br />
                                {(
                                    parseInt(feeConfig.fee) / 1000
                                ).toLocaleString(navigator.language)}
                                % (
                                {parseInt(
                                    feeConfig.fee.toString()
                                ).toLocaleString(navigator.language)}
                                )
                            </p>
                            <p className="border-t border-dashed border-activeblue p-4">
                                <span className="font-bold">Fee Receiver</span>
                                <br />
                                {feeConfig.receiver ===
                                '0x0000000000000000000000000000000000000000' ? (
                                    <span className="italic">
                                        Fee Distributor Managed
                                    </span>
                                ) : (
                                    visualAddress(feeConfig.receiver)
                                )}
                            </p>
                            <p className="border-t border-dashed border-activeblue p-4">
                                <span className="font-bold">
                                    Deployment Status
                                </span>
                                <div className="mt-2 flex flex-col">
                                    <div className="flex flex-row items-center">
                                        Avalanche:{' '}
                                        <FeeConfigStateDot
                                            syncState={FeeConfigState.DEPLOYED}
                                        />
                                    </div>
                                    <div className="flex flex-row items-center">
                                        Ethereum:{' '}
                                        {feeConfig.deleted ? (
                                            'removed'
                                        ) : (
                                            <FeeConfigStateDot
                                                syncState={deploymentStatusMap(
                                                    data?.feeConfigDeployStatesForEthereum.find(
                                                        (item: any) =>
                                                            item.id ===
                                                            feeConfig.id
                                                    )?.state
                                                )}
                                            />
                                        )}
                                    </div>
                                </div>
                            </p>
                            <p className="border-t border-dashed border-activeblue p-4">
                                <span className="font-bold">Revenue</span>
                                <div className="mt-4 flex flex-col gap-4">
                                    {/* <div className="flex flex-row items-center">
                                        Avalanche: 0
                                    </div> */}
                                    <div className="flex flex-row items-center">
                                        Ethereum:{' '}
                                        {(
                                            parseInt(feeConfig.amount) /
                                            10 ** 18
                                        ).toLocaleString(navigator.language, {
                                            maximumFractionDigits: 3,
                                        })}{' '}
                                        DGNX
                                    </div>
                                </div>
                            </p>
                        </div>
                    ))}
                </div>
                <div className="mt-5 flex flex-col flex-wrap items-start text-white text-opacity-50 lg:flex-row">
                    <span className="mr-4">
                        <FeeConfigStateDot
                            syncState={FeeConfigState.DEPLOYED}
                        />{' '}
                        deployed on network(s) <br />
                    </span>
                    <span className="mr-4">
                        <FeeConfigStateDot syncState={FeeConfigState.SYNC} />{' '}
                        synced to network(s) <br />
                    </span>
                    <span className="mr-4">
                        <FeeConfigStateDot syncState={FeeConfigState.UPDATED} />{' '}
                        recently updated <br />
                    </span>
                    <span className="mr-4">
                        <FeeConfigStateDot syncState={FeeConfigState.NEW} />{' '}
                        recently added <br />
                    </span>
                </div>
            </div>
            <div className="mb-10">
                <h2 className="mt-4 flex flex-col gap-1 font-title text-xl font-bold tracking-wide sm:mb-8 sm:flex-row">
                    <span className="text-techGreen">FEE</span>
                    <span className="text-degenOrange">DISTRIBUTION</span>
                </h2>
                <div className="xs:grid-cols-2 mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {data?.getFeeDistributorReceivers?.map(
                        (feeDistribution: any) => (
                            <div className="rounded-lg border-2 border-solid border-activeblue bg-gradient-to-bl from-darkerblue to-darkblue">
                                <p className="p-4">
                                    <span className="font-bold">Target</span>
                                    <br />
                                    {feeDistribution.name}
                                </p>
                                <p className="border-t border-dashed border-activeblue p-4">
                                    <span className="font-bold">
                                        Share (points of total points)
                                    </span>
                                    <br />{' '}
                                    {(
                                        (parseInt(feeDistribution.points) /
                                            parseInt(
                                                data.getFeeDistributorTotalPoints
                                            )) *
                                        100
                                    ).toLocaleString(navigator.language, {
                                        maximumFractionDigits: 3,
                                    })}
                                    % (
                                    {parseInt(
                                        feeDistribution.points
                                    ).toLocaleString(navigator.language)}{' '}
                                    of{' '}
                                    {parseInt(
                                        data.getFeeDistributorTotalPoints
                                    ).toLocaleString(navigator.language)}
                                    )
                                </p>
                                <p className="border-t border-dashed border-activeblue p-4">
                                    <span className="font-bold">Receiver</span>
                                    <br />
                                    {visualAddress(feeDistribution.receiver)}
                                </p>
                                <p className="border-t border-dashed border-activeblue p-4">
                                    <span className="font-bold">
                                        Target asset
                                    </span>
                                    <br />
                                    {feeDistribution.assetName || 'n/a'} (
                                    {feeDistribution.assetSymbol || 'n/a'})
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}