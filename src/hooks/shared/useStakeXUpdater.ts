import { useFetch } from '@dapphooks/shared/useFetch'
import { STAKEXUpdater } from '@dapptypes'
import { Address, zeroAddress } from 'viem'

export const useStakeXUpdater = (protocol: Address, chainId: number) =>
    useFetch<STAKEXUpdater>({
        enabled: Boolean(protocol && protocol != zeroAddress && chainId),
        url: `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/stakex/updater?protocol=${protocol}&chainId=${chainId}`,
    })
