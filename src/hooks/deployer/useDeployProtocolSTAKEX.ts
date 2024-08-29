import abi from '@dappabis/deployer/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { STAKEXDeployArgs } from '@dapptypes'
import { isUndefined, toLower } from 'lodash'
import { useEffect, useState } from 'react'
import { Address, decodeEventLog } from 'viem'
import { usePublicClient, useTransaction } from 'wagmi'

export const useDeployProtocolSTAKEX = (
    address: Address,
    chainId: number,
    value: bigint,
    deployArgs: STAKEXDeployArgs,
    enabled: boolean
) => {
    const [deployedProtocol, setDeployedProtocol] = useState<Address>()

    const execParams = {
        address,
        chainId,
        abi,
        functionName: 'deployerStakeXDeploy',
        args: [deployArgs],
        eventNames: ['StakeXProtocolDeployed'],
        value,
        enabled: Boolean(address && chainId && !isUndefined(value) && enabled),
    }
    const exec = useExecuteFunction(execParams)

    const publicClient = usePublicClient({ chainId })

    useEffect(() => {
        if (!address || !publicClient || !exec || !exec.hash) return
        publicClient
            ?.getTransactionReceipt({ hash: exec.hash })
            .then((receipt) => {
                receipt.logs
                    .filter((log) => toLower(address) === toLower(log.address))
                    .forEach((log) => {
                        const event = decodeEventLog({
                            abi,
                            data: log.data,
                            topics: log.topics,
                        }) as any
                        if (event.eventName === 'StakeXProtocolDeployed')
                            setDeployedProtocol(event.args.protocol)
                    })
            })
    }, [publicClient, exec, address])

    return { ...exec, deployedProtocol }
}
