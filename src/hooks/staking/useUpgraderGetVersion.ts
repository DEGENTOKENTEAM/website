import abi from '@dappabis/stakex/abi-ui.json'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

type Version = {
    major: number
    minor: number
    patch: number
}

export const useUpgraderGetVersion = (address: Address, chainId: number) =>
    useReadContract({
        address,
        chainId,
        abi,
        functionName: 'upgraderGetAvailableUpgrade',
        query: {
            enabled: Boolean(address && chainId),
            select: ([current, available, latest, updateAvailable]: [
                Version,
                Version,
                Version,
                boolean
            ]) => {
                return { current, available, latest, updateAvailable }
            },
        },
    })
