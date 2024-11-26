import { Spinner } from '@dappelements/Spinner'
import { useGetTokenInfo } from '@dapphooks/shared/useGetTokenInfo'
import {
    RouteRequest,
    RoutingsForTokenResponse,
    useGetRoutingsForToken,
} from '@dapphooks/staking/useGetRoutingsForToken'
import { TokenSearchInput } from '@dappshared/TokenSearchInput'
import { TokenInfo, TokenInfoResponse } from '@dapptypes'
import { cloneDeep, isArray } from 'lodash'
import Image from 'next/image'
import { ChangeEvent, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { RiArrowLeftWideLine, RiArrowRightWideLine } from 'react-icons/ri'
import { Address } from 'viem'

type TokensFormProps = PropsWithChildren<{
    tokens: TokenInfoResponse[]
    chainId: number
    onChange: (routings: RoutingsForTokenResponse | null) => void
}>

export const TokensForm = ({ onChange, chainId, tokens }: TokensFormProps) => {
    const [error, setError] = useState<string | null>(null)
    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>()
    const [token, setToken] = useState<Address | null>(null)
    const [isSearchActive, setIsSearchActive] = useState(false)
    const [routingPayload, setRoutingPayload] = useState<RouteRequest | null>(null)
    const [tokenThumbnails, setTokenThumbnails] = useState<{
        [tokenAddress: Address]: string | null
    } | null>(null)
    const [routings, setRoutings] = useState<RoutingsForTokenResponse | null>(null)

    const { data, isLoading: isLoadingTokenInfo } = useGetTokenInfo({ chainId, token })

    const {
        loading: isLoadingRoutings,
        response: responseRoutings,
        isError: isErrorRoutings,
        error: errorRoutings,
    } = useGetRoutingsForToken({
        enabled: Boolean(routingPayload),
        ...routingPayload!,
    })

    const resetError = () => setError(null)
    const setErrorMessage = useCallback((message: string | null) => {
        let _errorMessage: string | null
        switch (message) {
            case 'FROM_IN_TOS':
                _errorMessage = `The token you're about to search is already existing`
                break
            default:
                _errorMessage = null
                break
        }
        setError(_errorMessage)
    }, [])

    const resetForm = () => {
        setIsSearchActive(false)
        setRoutings(null)
        setRoutingPayload(null)
        setTokenThumbnails(null)
        setToken(null)
    }
    const onChangeTokenAddress = (e: ChangeEvent<HTMLInputElement>) => {
        const { validity, value } = e.target

        resetError()
        resetForm()

        if (validity.valid) {
            setIsSearchActive(true)
            setToken(value as Address)
        }
    }

    useEffect(() => {
        !isLoadingTokenInfo && !isLoadingRoutings && !isErrorRoutings && data && setTokenInfo(data)
    }, [data, isLoadingTokenInfo, isLoadingRoutings, isErrorRoutings])

    useEffect(() => {
        !isErrorRoutings && responseRoutings && setRoutings(responseRoutings)
        isErrorRoutings && setErrorMessage && setErrorMessage(errorRoutings)
    }, [responseRoutings, isErrorRoutings, errorRoutings, setErrorMessage])

    useEffect(() => {
        isLoadingTokenInfo && setTokenInfo(null)
    }, [isLoadingTokenInfo])

    useEffect(() => {
        if (!token) return
        setRoutingPayload({
            from: token,
            tos: tokens.map((token) => token.source),
            chainId,
        })
    }, [token])

    useEffect(() => {
        onChange && onChange(routings)

        if (isArray(routings)) {
            const tokenRequests: Promise<Response>[] = []
            const tokenCache: Address[] = []
            routings.forEach(({ paths }) =>
                paths.forEach(({ fromToken, toToken }) => {
                    if (!tokenCache.includes(fromToken.address)) {
                        tokenCache.push(fromToken.address)
                        tokenRequests.push(
                            fetch(
                                `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/coingecko/api/v3/coins/id/contract/${fromToken.address}`
                            )
                        )
                    }

                    if (!tokenCache.includes(toToken.address)) {
                        tokenCache.push(toToken.address)
                        tokenRequests.push(
                            fetch(
                                `${process.env.NEXT_PUBLIC_STAKEX_API_ENDPOINT}/coingecko/api/v3/coins/id/contract/${toToken.address}`
                            )
                        )
                    }
                })
            )

            Promise.all(tokenRequests)
                .then(async (responsesRaw) => {
                    const _tokenThumbnails: typeof tokenThumbnails = {}

                    while (tokenCache.length) {
                        const [tokenAddress] = tokenCache.splice(0, 1)
                        const [tokenDataRaw] = responsesRaw.splice(0, 1)
                        const tokenData = await tokenDataRaw.json()
                        if (!tokenData.error && !tokenData.image.large.includes('missing')) {
                            _tokenThumbnails[tokenAddress.toLowerCase()] = tokenData.image.large
                        } else {
                            _tokenThumbnails[
                                tokenAddress.toLowerCase()
                            ] = `https://tokens-data.1inch.io/images/${tokenAddress.toLowerCase()}.png`
                        }
                    }

                    return _tokenThumbnails
                })
                .then(setTokenThumbnails)
        }
    }, [routings])

    return (
        <div className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4 rounded-lg bg-dapp-blue-400 p-3">
                <div className="flex items-center justify-between text-lg font-bold">Add New Token</div>
                <p>
                    TO add a new token to your staking solution, you have to enter the token address in the text field
                    below. The information you&apos;ll see show you what DEXs will be used in the reward claiming
                    process of your stakers.
                </p>
                <div className="flex flex-col gap-2">
                    <TokenSearchInput
                        error={error}
                        isLoadingTokenInfo={isLoadingTokenInfo}
                        isSearchActive={isSearchActive}
                        onChangeTokenAddress={onChangeTokenAddress}
                        tokenInfo={tokenInfo}
                        showDescription={true}
                    />
                </div>
                {!isErrorRoutings && routingPayload && (
                    <div className="flex flex-col gap-6 p-2">
                        <div className="flex grow flex-row gap-2 font-bold">
                            <span className=" min-w-[100px] text-center">Reward</span>
                            <span className="hidden grow text-center md:inline-block">Exchange Swap Route</span>
                            <span className="inline-block grow md:hidden"></span>
                            <span className=" min-w-[100px] text-center">Payout</span>
                        </div>
                        <div className="flex flex-col gap-6">
                            {(isLoadingRoutings || !tokenThumbnails) && (
                                <div className="flex justify-center">
                                    <Spinner theme="dark" />
                                </div>
                            )}
                            {!isLoadingRoutings && tokenInfo && tokenThumbnails && (
                                <div className="relative">
                                    <div className="flex flex-row gap-2">
                                        <div className="flex min-w-[100px] max-w-xs flex-col items-center justify-center gap-2 rounded-l-4xl p-2 pr-0 md:pr-2">
                                            <Image
                                                width={48}
                                                height={48}
                                                src={tokenThumbnails![tokenInfo.source.toLowerCase()]}
                                                alt="Token Image"
                                                className="rounded-full"
                                            />
                                            <span>{tokenInfo.symbol}</span>
                                        </div>
                                        <div className="flex grow flex-row gap-2 rounded-r-4xl p-2 pl-0 md:pl-2">
                                            <div className="relative -top-4 flex grow flex-row items-center justify-center">
                                                {[40, 50, 60, 80, 100].map((v) => (
                                                    <RiArrowRightWideLine
                                                        key={v}
                                                        className={`size-6 text-dapp-cyan-500`}
                                                        style={{ opacity: v / 100 }}
                                                    />
                                                ))}
                                            </div>

                                            <div className="flex min-w-[80px] max-w-xs flex-col items-center justify-center gap-2">
                                                <Image
                                                    width={48}
                                                    height={48}
                                                    src={tokenThumbnails![tokenInfo.source.toLowerCase()]}
                                                    alt="Token Image"
                                                    className="rounded-full"
                                                />
                                                <span>{tokenInfo.symbol}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {!isLoadingRoutings &&
                                tokenThumbnails &&
                                routings &&
                                routings.map((route, i) => (
                                    <div key={i} className="flex flex-row gap-2">
                                        <div className="flex min-w-[100px] max-w-xs flex-col items-center justify-center gap-2 rounded-l-4xl p-2 pr-0 md:pr-2">
                                            <Image
                                                width={48}
                                                height={48}
                                                src={tokenThumbnails![route.toToken.address.toLowerCase()]}
                                                alt="Token Image"
                                                className="rounded-full"
                                            />
                                            <span>{route.toToken.symbol}</span>
                                        </div>
                                        {route.paths &&
                                            route.paths.length > 1 &&
                                            cloneDeep(route.paths)
                                                .reverse()
                                                .map(
                                                    (path, i) =>
                                                        i > 0 && (
                                                            <div key={i} className="hidden grow flex-row p-4 md:flex">
                                                                <div className="flex grow flex-row items-center justify-center">
                                                                    <RiArrowLeftWideLine />
                                                                    <span className="text-xs">{path.dex.name}</span>
                                                                    <RiArrowRightWideLine />
                                                                </div>
                                                                <div className="flex min-w-[80px] max-w-xs flex-col items-center justify-center gap-2">
                                                                    <Image
                                                                        width={32}
                                                                        height={32}
                                                                        src={
                                                                            tokenThumbnails![
                                                                                path.toToken.address.toLowerCase()
                                                                            ]
                                                                        }
                                                                        alt="Token Image"
                                                                        className="rounded-full"
                                                                    />
                                                                    <span className="text-sm">
                                                                        {path.toToken.symbol}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )
                                                )}
                                        <div className="flex grow flex-row gap-2 rounded-r-4xl p-2 pl-0 md:pl-2">
                                            <div className="relative -top-4 flex grow flex-row items-center justify-center md:hidden">
                                                {[40, 50, 60, 80, 100].map((v) => (
                                                    <RiArrowRightWideLine
                                                        key={v}
                                                        className={`size-6 text-dapp-cyan-500 `}
                                                        style={{ opacity: v / 100 }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="hidden grow flex-row items-center justify-center md:flex">
                                                <RiArrowLeftWideLine />
                                                <span className="text-xs">
                                                    {route.paths[route.paths.length - 1].dex.name}
                                                </span>
                                                <RiArrowRightWideLine />
                                            </div>
                                            <div className="flex min-w-[80px] max-w-xs flex-col items-center justify-center gap-2">
                                                <Image
                                                    width={48}
                                                    height={48}
                                                    src={tokenThumbnails![route.fromToken.address.toLowerCase()]}
                                                    alt="Token Image"
                                                    className="rounded-full"
                                                />
                                                <span>{route.fromToken.symbol}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
