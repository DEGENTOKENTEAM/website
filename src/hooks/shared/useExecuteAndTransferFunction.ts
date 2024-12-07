import { omit } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Address } from 'viem'
import { useERC20Approve } from './useERC20Approve'
import { useExecuteFunction } from './useExecuteFunction'
import { useHasERC20Allowance } from './useHasERC20Allowance'

type useExecuteAndTransferFunctionnProps = {
    address: Address
    chainId: number
    abi: any
    functionName: string
    args: any[]
    eventNames: string[]
    transferToken: Address
    transferAmount: bigint
    account: Address
    value?: bigint
    enabled?: boolean
    onEvent?: (event: any) => void
    onEventMatch?: (event: any) => void
    onError?: (error: any) => void
}

export const useExecuteAndTransferFunction = (
    props: useExecuteAndTransferFunctionnProps
) => {
    const {
        address,
        chainId,
        account,

        // for the approval process
        transferToken,
        transferAmount,
    } = props

    ///
    /// ERC20 Allowance
    ///
    const allowanceProps = useHasERC20Allowance(
        transferToken,
        account,
        address,
        chainId
    )

    ///
    /// ERC20 Approval Process for the Token
    ///
    const approveProps = useERC20Approve(
        transferToken,
        address,
        transferAmount,
        chainId
    )

    ///
    /// Execute Function that contains a token transfer
    ///
    const execProps = useExecuteFunction(
        omit(
            {
                ...props,
                enabled: Boolean(
                    allowanceProps.data && allowanceProps.data >= transferAmount
                ),
            },
            ['transferToken', 'transferAmount']
        )
    )

    ///
    /// Logic
    ///
    const [hasAllowance, setHasAllowance] = useState(false)
    const initiate = useCallback(() => {
        // if allowance is sufficient
        if (hasAllowance) execProps.write()
        else approveProps.write()
    }, [hasAllowance, transferAmount, execProps.write, approveProps.write])

    const reset = () => {
        allowanceProps.refetch()
        approveProps.reset()
        execProps.reset()
    }

    // check has allowance
    useEffect(() => {
        setHasAllowance(
            Boolean(
                allowanceProps.data && allowanceProps.data >= transferAmount
            )
        )
    }, [allowanceProps.data, transferAmount])

    // initiate execution after an initiated approval went through upfront
    useEffect(() => {
        if (approveProps.hash && approveProps.isSuccess) {
            if (hasAllowance) {
                execProps.write()
            } else if (!allowanceProps.isPending && !allowanceProps.isLoading) {
                allowanceProps.refetch()
            }
        }
    }, [
        approveProps.hash,
        approveProps.isSuccess,
        allowanceProps.isPending,
        allowanceProps.isLoading,
        hasAllowance,
    ])

    return {
        initiate,
        reset,
        hasAllowance,
        approval: approveProps,
        allowance: allowanceProps,
        execute: execProps,
    }
}
