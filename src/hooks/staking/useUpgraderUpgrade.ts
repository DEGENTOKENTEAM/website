import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { Address } from 'viem'

export const useUpgraderUpgrade = (address: Address, chainId: number) =>
    useExecuteFunction({
        abi,
        address,
        chainId,
        functionName: 'upgraderPerformUpgrade',
        args: [],
        eventNames: ['Upgraded'],
    })
