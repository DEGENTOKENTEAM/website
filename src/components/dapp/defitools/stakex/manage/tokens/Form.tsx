import { Spinner } from '@dappelements/Spinner'
import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useGetTokenInfo } from '@dapphooks/shared/useGetTokenInfo'
import {
    RouteRequest,
    RoutingsForTokenResponse,
    useGetRoutingsForToken,
} from '@dapphooks/staking/useGetRoutingsForToken'
import { useGetTargetTokens } from '@dapphooks/staking/useGetTargetTokens'
import { TokenInfo, TokenInfoResponse } from '@dapptypes'
import { Checkbox, Description, Field, Input, Label } from '@headlessui/react'
import clsx from 'clsx'
import { isArray } from 'lodash'
import Image from 'next/image'
import {
    ChangeEvent,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa'
import { RiArrowRightWideLine } from 'react-icons/ri'
import { Address } from 'viem'

type TokensFormProps = PropsWithChildren<{
    error: string | null
    onChange: (
        routings: RoutingsForTokenResponse | null,
        isReward: boolean
    ) => void
}>

export const TokensForm = ({ onChange, error: _error }: TokensFormProps) => {
    const {
        data: { chain, protocol },
    } = useContext(ManageStakeXContext)

    const [error, setError] = useState<string | null>(null)
    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>()
    const [tokenAddress, setTokenAddress] = useState<Address | null>()
    const [isSearchActive, setIsSearchActive] = useState(false)
    const [isReward, setIsReward] = useState(true)
    const [tokens, setTokens] = useState<TokenInfoResponse[]>()
    const [routingPayload, setRoutingPayload] = useState<RouteRequest | null>(
        null
    )
    const [tokenThumbnails, setTokenThumbnails] = useState<{
        [tokenAddress: Address]: string | null
    } | null>(null)
    const [routings, setRoutings] = useState<RoutingsForTokenResponse | null>(
        null
    )

    const { data, isLoading: isLoadingTokenInfo } = useGetTokenInfo({
        enabled: Boolean(chain && tokenAddress),
        chainId: chain?.id!,
        token: tokenAddress!,
    })

    const { data: dataTargetTokens } = useGetTargetTokens(protocol, chain?.id!)

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
        setTokenAddress(null)
    }
    const onChangeTokenAddress = (e: ChangeEvent<HTMLInputElement>) => {
        const { validity, value } = e.target

        resetError()
        resetForm()

        if (validity.valid) {
            setIsSearchActive(true)
            setTokenAddress(value as Address)
        }
    }

    useEffect(() => {
        !isLoadingTokenInfo &&
            !isLoadingRoutings &&
            !isErrorRoutings &&
            data &&
            setTokenInfo(data)
    }, [data, isLoadingTokenInfo, isLoadingRoutings, isErrorRoutings])

    useEffect(() => {
        console.log({ responseRoutings, isErrorRoutings, errorRoutings })
        !isErrorRoutings && responseRoutings && setRoutings(responseRoutings)
        if (isErrorRoutings) setErrorMessage(errorRoutings)
    }, [responseRoutings, isErrorRoutings, errorRoutings])

    useEffect(() => {
        isLoadingTokenInfo && setTokenInfo(null)
    }, [isLoadingTokenInfo])

    useEffect(() => {
        dataTargetTokens && setTokens(dataTargetTokens)
    }, [dataTargetTokens])

    useEffect(() => {
        if (!(tokens && tokens.length > 0 && tokenAddress && chain)) return
        setRoutingPayload({
            from: tokenAddress,
            tos: tokens.map((token) => token.source),
            chainId: chain.id,
        })
    }, [tokens, tokenAddress, chain])

    useEffect(() => {
        onChange(routings, isReward)

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
                    let _tokenCache = tokenCache
                    for (const response of responsesRaw) {
                        const res = await response.json()
                        if (!res.error) {
                            _tokenCache = _tokenCache.filter(
                                (token) =>
                                    token.toLowerCase() !=
                                    res.contract_address.toLowerCase()
                            )
                            _tokenThumbnails[
                                res.contract_address.toLowerCase()
                            ] = res.image.large
                        }
                    }

                    if (_tokenCache.length > 0)
                        for (const token of _tokenCache)
                            _tokenThumbnails[
                                token.toLowerCase()
                            ] = `https://tokens-data.1inch.io/images/${token.toLowerCase()}.png`

                    return _tokenThumbnails
                })
                .then(setTokenThumbnails)
        }
    }, [routings])

    return (
        <div className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4 rounded-lg bg-dapp-blue-400 p-3">
                <div className="flex items-center justify-between text-lg font-bold">
                    Add Token
                </div>
                <div className="flex flex-col gap-2">
                    <Field className="flex flex-col gap-2">
                        <Description className="text-xs/4 text-dapp-cyan-50/50">
                            Enter an ERC20 token address
                        </Description>
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
                                    {!error &&
                                        !isLoadingTokenInfo &&
                                        tokenInfo &&
                                        tokenInfo?.name && (
                                            <div className="flex flex-row items-center gap-2">
                                                <FaRegCheckCircle className="h-5 w-5 text-success" />{' '}
                                                Found: {tokenInfo.name} (
                                                {tokenInfo.symbol}) with{' '}
                                                {Number(tokenInfo.decimals)}{' '}
                                                decimals
                                            </div>
                                        )}
                                    {!error && isLoadingTokenInfo && (
                                        <div className="flex flex-row items-center gap-2">
                                            <Spinner
                                                className="!h-5 !w-5"
                                                theme="dark"
                                            />
                                            Searching...
                                        </div>
                                    )}
                                    {((!isLoadingTokenInfo &&
                                        tokenInfo &&
                                        !tokenInfo?.name) ||
                                        error) && (
                                        <div className="flex flex-row items-center gap-2">
                                            <FaRegTimesCircle className="h-5 w-5 text-error" />{' '}
                                            {error ? (
                                                error
                                            ) : (
                                                <span>
                                                    Not found! Please check the
                                                    entered address
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </Field>
                    <Field className="flex flex-col gap-2 px-2 pt-2">
                        <div className="flex gap-2">
                            <Checkbox
                                checked={isReward}
                                onChange={setIsReward}
                                className="group block h-5 w-5 rounded-sm border border-dapp-cyan-50 bg-transparent data-[checked]:border-dapp-cyan-500  data-[checked]:bg-dapp-cyan-500"
                            >
                                <svg
                                    className="stroke-white opacity-0 group-data-[checked]:opacity-100"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                >
                                    <path
                                        d="M3 8L6 11L11 3.5"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Checkbox>
                            <Label>Reward Token</Label>
                        </div>
                    </Field>
                </div>
                {!isErrorRoutings && routingPayload && (
                    <div className="flex flex-col gap-6 pt-6">
                        <div className="text-lg font-bold">
                            Necessary Token Exchanges
                        </div>
                        <div className="flex flex-grow flex-row gap-2 font-bold">
                            <span className="flex-grow">Reward Token</span>
                            <span>Payout Token</span>
                        </div>
                        <div className="flex flex-col gap-6">
                            {(isLoadingRoutings || !tokenThumbnails) && (
                                <div className="flex justify-center">
                                    <Spinner theme="dark" />
                                </div>
                            )}
                            {!isLoadingRoutings &&
                                tokenInfo &&
                                tokenThumbnails && (
                                    <div className="relative">
                                        <div
                                            className={clsx(
                                                `flex flex-row gap-2`,
                                                { 'opacity-30': !isReward }
                                            )}
                                        >
                                            <div className="flex min-w-[100px] max-w-xs flex-col items-center justify-center gap-2 rounded-l-4xl p-2 pr-0 md:pr-2">
                                                <Image
                                                    width={48}
                                                    height={48}
                                                    src={
                                                        tokenThumbnails![
                                                            tokenInfo.source.toLowerCase()
                                                        ]
                                                    }
                                                    alt="Token Image"
                                                    className="rounded-full"
                                                />
                                                <span>{tokenInfo.symbol}</span>
                                            </div>
                                            <div className="flex flex-grow flex-row gap-2 rounded-r-4xl p-2 pl-0 md:pl-2">
                                                <div className="relative -top-4 flex flex-grow flex-row items-center justify-center">
                                                    {[40, 50, 60, 80, 100].map(
                                                        (v) => (
                                                            <RiArrowRightWideLine
                                                                key={v}
                                                                className={`h-6 w-6 opacity-${v} text-dapp-cyan-500 `}
                                                            />
                                                        )
                                                    )}
                                                </div>

                                                <div className="flex min-w-[80px] max-w-xs flex-col items-center justify-center gap-2">
                                                    <Image
                                                        width={48}
                                                        height={48}
                                                        src={
                                                            tokenThumbnails![
                                                                tokenInfo.source.toLowerCase()
                                                            ]
                                                        }
                                                        alt="Token Image"
                                                        className="rounded-full"
                                                    />
                                                    <span>
                                                        {tokenInfo.symbol}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {!isReward && (
                                            <div
                                                className={clsx(
                                                    `absolute inset-0 flex items-center justify-center rounded-lg `,
                                                    {
                                                        'bg-dapp-blue-800/70':
                                                            !isReward,
                                                    }
                                                )}
                                            >
                                                <span className="text-2xl font-extrabold text-dapp-cyan-50/20 drop-shadow">
                                                    Reward Token Disabled
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            {!isLoadingRoutings &&
                                tokenThumbnails &&
                                routings &&
                                routings.map((route, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-row gap-2"
                                    >
                                        <div className="flex min-w-[100px] max-w-xs flex-col items-center justify-center gap-2 rounded-l-4xl p-2 pr-0 md:pr-2">
                                            <Image
                                                width={48}
                                                height={48}
                                                src={
                                                    tokenThumbnails![
                                                        route.toToken.address.toLowerCase()
                                                    ]
                                                }
                                                alt="Token Image"
                                                className="rounded-full"
                                            />
                                            <span>{route.toToken.symbol}</span>
                                        </div>
                                        {route.paths &&
                                            route.paths.length > 1 &&
                                            route.paths.toReversed().map(
                                                (path, i) =>
                                                    i > 0 && (
                                                        <div
                                                            key={i}
                                                            className="hidden flex-grow flex-row p-4 md:flex"
                                                        >
                                                            <div className="flex flex-grow flex-row items-center justify-center">
                                                                <span className="text-xs">
                                                                    {
                                                                        path.dex
                                                                            .name
                                                                    }
                                                                </span>
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
                                                                    {
                                                                        path
                                                                            .toToken
                                                                            .symbol
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                            )}
                                        <div className="flex flex-grow flex-row gap-2 rounded-r-4xl p-2 pl-0 md:pl-2">
                                            <div className="relative -top-4 flex flex-grow flex-row items-center justify-center md:hidden">
                                                {[40, 50, 60, 80, 100].map(
                                                    (v) => (
                                                        <RiArrowRightWideLine
                                                            key={v}
                                                            className={`h-6 w-6 opacity-${v} text-dapp-cyan-500 `}
                                                        />
                                                    )
                                                )}
                                            </div>
                                            <div className="hidden flex-grow flex-row items-center justify-center md:flex">
                                                <span className="text-xs">
                                                    {
                                                        route.paths[
                                                            route.paths.length -
                                                                1
                                                        ].dex.name
                                                    }
                                                </span>
                                                <RiArrowRightWideLine />
                                            </div>
                                            <div className="flex min-w-[80px] max-w-xs flex-col items-center justify-center gap-2">
                                                <Image
                                                    width={48}
                                                    height={48}
                                                    src={
                                                        tokenThumbnails![
                                                            route.fromToken.address.toLowerCase()
                                                        ]
                                                    }
                                                    alt="Token Image"
                                                    className="rounded-full"
                                                />
                                                <span>
                                                    {route.fromToken.symbol}
                                                </span>
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
