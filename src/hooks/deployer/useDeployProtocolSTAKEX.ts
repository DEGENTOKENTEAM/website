import abi from '@dappabis/deployer/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { STAKEXDeployArgs } from '@dapptypes'
import { useState } from 'react'
import { Address } from 'viem'

export const useDeployProtocolSTAKEX = (
    address: Address,
    chainId: number,
    deployArgs: STAKEXDeployArgs,
    enabled: boolean
) => {
    const [deployedProtocol, setDeployedProtocol] = useState<Address>()

    const onEventMatch = (event: any) =>
        event && event.args && setDeployedProtocol(event.args.protocol)

    const execProps = useExecuteFunction({
        address,
        chainId,
        abi,
        functionName: 'deployerStakeXDeploy',
        args: [deployArgs],
        eventNames: ['StakeXProtocolDeployed'],
        enabled,
        onEventMatch,
    })

    return { ...execProps, deployedProtocol }
}
