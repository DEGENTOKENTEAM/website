import abi from '@dappabis/stakex/abi-ui.json'
import { useExecuteFunction } from '@dapphooks/shared/useExecuteFunction'
import { isBoolean } from 'lodash'
import { useEffect, useState } from 'react'
import { Address } from 'viem'

export const useToggleRewardTokenStatus = (
    address: Address,
    chainId: number
) => {
    const [token, setToken] = useState<Address | null>(null)
    const [status, setStatus] = useState<boolean | null>(null)

    const execProps = useExecuteFunction({
        abi,
        address,
        args: [token, status],
        functionName: 'stakeXEnableRewardToken',
        chainId,
        eventNames: ['EnabledRewardToken', 'DisabledRewardToken'],
        enabled: Boolean(token) && isBoolean(status),
        onEventMatch: (_: any) => {
            setToken(null)
            setStatus(null)
        },
    })

    const { write } = execProps

    const writeWrapper = (_token: Address, _status: boolean) => {
        setToken(_token)
        setStatus(_status)
    }

    useEffect(() => {
        isBoolean(status) && token && write && write()
    }, [write, token, status])

    return { ...execProps, write: writeWrapper, token }
}
