import { useFetch } from '@dapphooks/shared/useFetch'
import { STAKEXAccountInfo } from '@dapptypes'
import { Address, zeroAddress } from 'viem'

export const useStakeXGetAccountInfo = (account: Address) =>
    useFetch<STAKEXAccountInfo>({
        enabled: Boolean(account && account != zeroAddress),
        url: `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/stakex/account-info/${account}`,
    })
