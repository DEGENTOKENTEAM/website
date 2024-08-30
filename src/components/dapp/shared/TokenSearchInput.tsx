import { Spinner } from '@dappelements/Spinner'
import { TokenInfo } from '@dapptypes'
import { Description, Field, Input } from '@headlessui/react'
import { ChangeEvent } from 'react'
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa'

type TokenSearchInputProps = {
    onChangeTokenAddress: (e: ChangeEvent<HTMLInputElement>) => void
    isSearchActive: boolean
    isLoadingTokenInfo: boolean
    tokenInfo: TokenInfo | null | undefined
    error: string | null
    showDescription?: boolean
}
export const TokenSearchInput = ({
    onChangeTokenAddress,
    isLoadingTokenInfo,
    isSearchActive,
    tokenInfo,
    error,
    showDescription,
}: TokenSearchInputProps) => {
    return (
        <Field className="flex flex-col gap-2">
            {showDescription && (
                <Description className="text-xs/4 text-dapp-cyan-50/50">Enter an ERC20 token address</Description>
            )}
            <Input
                pattern="0x[a-zA-Z0-9]{40}"
                onChange={onChangeTokenAddress}
                required={true}
                disabled={false}
                placeholder="0x..."
                className="mt-2 w-full rounded-lg border-0 bg-dapp-blue-800 p-2 text-2xl leading-10 outline-0 [appearance:textfield] focus:ring-0 focus:ring-offset-0"
            />
            {isSearchActive && (
                <>
                    <div className="pl-2 text-xs">
                        {!error && !isLoadingTokenInfo && tokenInfo && tokenInfo?.name && (
                            <div className="flex flex-row items-center gap-2">
                                <FaRegCheckCircle className="h-5 w-5 text-success" /> Found: {tokenInfo.name} (
                                {tokenInfo.symbol}) with {Number(tokenInfo.decimals)} decimals
                            </div>
                        )}
                        {!error && isLoadingTokenInfo && (
                            <div className="flex flex-row items-center gap-2">
                                <Spinner className="!h-5 !w-5" theme="dark" />
                                Searching...
                            </div>
                        )}
                        {((!isLoadingTokenInfo && tokenInfo && !tokenInfo?.name) || error) && (
                            <div className="flex flex-row items-center gap-2">
                                <FaRegTimesCircle className="h-5 w-5 text-error" />{' '}
                                {error ? error : <span>Not found! Please check the entered address</span>}
                            </div>
                        )}
                    </div>
                </>
            )}
        </Field>
    )
}
