import abi from '@dappabis/deployer/abi-ui.json'
import { STAKEXDeployArgs } from '@dapptypes'
import { isUndefined } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Address } from 'viem'
import { useGasPrice, usePublicClient } from 'wagmi'
import protocols from './../../../config/protocols'

export const useGetNetworkFeeEstimationDeployerSTAKEX = (
    address: Address,
    chainId: number,
    deployFee: bigint,
    deployArgs: STAKEXDeployArgs | null
) => {
    const [data, setData] = useState<bigint>()
    const [gas, setGas] = useState(0n)
    const [gasPrice, setGasPrice] = useState(0n)
    const [isLoading, setIsLoading] = useState(false)
    const publicClient = usePublicClient({ chainId })
    const { data: dataGasPrice, refetch: refetchGasPrice } = useGasPrice({
        chainId,
    })

    const fetch = useCallback(() => {
        if (
            !publicClient ||
            !address ||
            !chainId ||
            !deployArgs ||
            !refetchGasPrice ||
            !deployArgs.initParams.manager ||
            !deployArgs.initParams.stakingToken ||
            !deployArgs.initParams.stableToken ||
            !deployArgs.initParams.swaps ||
            !deployArgs.initParams.rewards ||
            !deployArgs.initParams.bucketsToAdd
        )
            return

        refetchGasPrice()
        publicClient
            .estimateContractGas({
                abi,
                address,
                functionName: 'deployerStakeXDeploy',
                args: [deployArgs],
                value: deployFee,
                account: protocols[chainId].nativeWrapper,
            })
            .then((estimatedGas) => {
                setGas(estimatedGas)
            })
            .catch((err) => {
                console.log('useGetNetworkFeeEstimationDeployerSTAKEX', { err })
            })
    }, [publicClient, address, chainId, deployFee, deployArgs, refetchGasPrice])

    useEffect(() => {
        fetch && fetch()
    }, [publicClient, address, chainId, deployArgs, fetch])

    useEffect(() => {
        dataGasPrice && setGasPrice(dataGasPrice)
    }, [dataGasPrice])

    useEffect(() => {
        setData(gas * gasPrice)
    }, [gas, gasPrice])

    useEffect(() => {
        setIsLoading(!isUndefined(data))
    }, [data])

    return { fetch, data, isLoading }
}
