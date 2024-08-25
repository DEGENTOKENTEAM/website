import controllerAbi from '@dappabis/controller.json'
import erc20Abi from '@dappabis/erc20.json'
import vaultAbi from '@dappabis/vault.json'
import { Config, readContract } from '@wagmi/core'
import { getChainById } from 'shared/supportedChains'
import { Address, createPublicClient, http } from 'viem'

export const readControllerContract = async (
    chainId: number,
    args: {
        functionName: string
        args?: any[]
        account?: Address
    }
) => {
    const chain = getChainById(chainId)
    const client = createPublicClient({ chain, transport: http() })
    return await client.readContract({
        address: process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS! as Address,
        abi: controllerAbi,
        functionName: args.functionName,
        args: args.args,
        account: args.account,
    })
}

export const readVaultContract = async (
    chainId: number,
    args: {
        address: Address
        functionName: string
        args?: any[]
        account?: Address
    }
) => {
    const chain = getChainById(chainId)
    const client = createPublicClient({ chain, transport: http() })
    return await client.readContract({
        address: args.address,
        abi: vaultAbi,
        functionName: args.functionName,
        args: args.args,
        account: args.account,
    })
}

export const readTokenContract = async (
    config: Config,
    args: {
        address: Address
        functionName: any
        args?: any[any]
        account?: Address
    }
) => {
    return await readContract(config, {
        address: args.address,
        abi: erc20Abi,
        functionName: args.functionName,
        args: args.args,
        account: args.account,
    })
}
