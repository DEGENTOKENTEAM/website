import { Spinner } from '@dappelements/Spinner'
import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useGetTokenInfo } from '@dapphooks/shared/useGetTokenInfo'
import { useGetRewardTokens } from '@dapphooks/staking/useGetRewardTokens'
import {
    RouteRequest,
    RoutingsForTokenResponse,
    useGetRoutingsForToken,
} from '@dapphooks/staking/useGetRoutingsForToken'
import { useGetTargetTokens } from '@dapphooks/staking/useGetTargetTokens'
import { TokenInfo, TokenInfoResponse } from '@dapptypes'
import { Description, Field, Input } from '@headlessui/react'
import { capitalize, get, lowerCase } from 'lodash'
import Image from 'next/image'
import {
    ChangeEvent,
    PropsWithChildren,
    useContext,
    useEffect,
    useState,
} from 'react'
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa'
import { RiArrowRightWideLine } from 'react-icons/ri'
import { Address } from 'viem'

export const TokenType = {
    reward: 'reward',
    payout: 'payout',
}

type TokensFormProps = PropsWithChildren<{
    tokenType: keyof typeof TokenType
}>

export const TokensForm = ({ tokenType }: TokensFormProps) => {
    const {
        data: { chain, protocol },
    } = useContext(ManageStakeXContext)
    const ucfTokenType = capitalize(get(TokenType, tokenType))
    const lcTokenType = lowerCase(ucfTokenType)

    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>()
    const [tokenAddress, setTokenAddress] = useState<Address>()
    const [isSearchActive, setIsSearchActive] = useState(false)
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

    const { data: dataTokens } =
        lcTokenType == TokenType.reward
            ? useGetRewardTokens(protocol, chain?.id!)
            : useGetTargetTokens(protocol, chain?.id!)

    const { loading: isLoadingRoutings, response: responseRoutings } =
        useGetRoutingsForToken({
            enabled: Boolean(routingPayload),
            ...routingPayload!,
        })

    const onChangeTokenAddress = (e: ChangeEvent<HTMLInputElement>) => {
        const { validity, value } = e.target
        if (validity.valid) {
            setIsSearchActive(true)
            setTokenAddress(value as Address)
        }

        // if nothing is entered, it's like a reset
        if (!value || !validity.valid) {
            setIsSearchActive(false)
            setRoutings(null)
            setRoutingPayload(null)
            setTokenThumbnails(null)
        }
    }

    useEffect(() => data && setTokenInfo(data), [data])

    useEffect(
        () => responseRoutings && setRoutings(responseRoutings),
        [responseRoutings]
    )

    useEffect(() => {
        if (isLoadingTokenInfo) setTokenInfo(null)
    }, [isLoadingTokenInfo])

    useEffect(() => {
        dataTokens && setTokens(dataTokens)
    }, [dataTokens])

    useEffect(() => {
        if (!(tokens && tokens.length > 0 && tokenAddress && chain)) return
        setRoutingPayload({
            from: tokenAddress,
            tos: tokens.map((token) => token.source),
            chainId: chain.id,
        })
    }, [tokens, tokenAddress, chain])

    useEffect(() => {
        if (routings) {
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
                    Add {ucfTokenType} Token
                </div>
                <div className="flex flex-col gap-2 pt-2">
                    <Field className="flex flex-col gap-2">
                        <Description className="px-2 text-xs/4 text-dapp-cyan-50/50">
                            Enter an ERC20 token address that should be used as
                            a {lcTokenType} token
                        </Description>
                        <Input
                            pattern="0x[a-zA-Z0-9]{40}"
                            onChange={onChangeTokenAddress}
                            disabled={false}
                            placeholder="0x..."
                            className="mt-2 w-full rounded-lg border-0 bg-dapp-blue-800 p-2 text-2xl leading-10 outline-0 [appearance:textfield] focus:ring-0 focus:ring-offset-0"
                        />
                        {isSearchActive && (
                            <div className="pl-2 text-xs">
                                {!isLoadingTokenInfo &&
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
                                {isLoadingTokenInfo && (
                                    <div className="flex flex-row items-center gap-2">
                                        <Spinner
                                            className="!h-5 !w-5"
                                            theme="dark"
                                        />
                                        Searching...
                                    </div>
                                )}
                                {!isLoadingTokenInfo &&
                                    tokenInfo &&
                                    !tokenInfo?.name && (
                                        <div className="flex flex-row items-center gap-2">
                                            <FaRegTimesCircle className="h-5 w-5 text-error" />{' '}
                                            Not found! Please check the entered
                                            address
                                        </div>
                                    )}
                            </div>
                        )}
                    </Field>
                </div>
                {routingPayload && (
                    <div className="flex flex-col gap-6 pt-6">
                        <div className="text-lg font-bold">
                            Necessary Token Exchanges
                        </div>
                        <div className="flex flex-grow flex-row gap-2 font-bold">
                            <span className="flex-grow">
                                {ucfTokenType == TokenType.reward
                                    ? 'Payout'
                                    : 'Reward'}{' '}
                                Token
                            </span>
                            <span>
                                {ucfTokenType == TokenType.reward
                                    ? 'Reward'
                                    : 'Payout'}{' '}
                                Token
                            </span>
                        </div>
                        <div className="flex flex-col gap-6">
                            {isLoadingRoutings && <Spinner theme="dark" />}
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
                                                        (ucfTokenType ==
                                                        TokenType.reward
                                                            ? route.fromToken
                                                            : route.toToken
                                                        ).address.toLowerCase()
                                                    ]
                                                }
                                                alt="Token Image"
                                                className="rounded-full"
                                            />
                                            <span>
                                                {
                                                    (ucfTokenType ==
                                                    TokenType.reward
                                                        ? route.fromToken
                                                        : route.toToken
                                                    ).symbol
                                                }
                                            </span>
                                        </div>
                                        {route.paths &&
                                            route.paths.length > 1 &&
                                            (ucfTokenType == TokenType.reward
                                                ? route.paths
                                                : route.paths.toReversed()
                                            ).map(
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
                                                                            (ucfTokenType ==
                                                                            TokenType.reward
                                                                                ? path.fromToken
                                                                                : path.toToken
                                                                            ).address.toLowerCase()
                                                                        ]
                                                                    }
                                                                    alt="Token Image"
                                                                    className="rounded-full"
                                                                />
                                                                <span className="text-sm">
                                                                    {
                                                                        (ucfTokenType ==
                                                                        TokenType.reward
                                                                            ? path.fromToken
                                                                            : path.toToken
                                                                        ).symbol
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
                                                            (ucfTokenType ==
                                                            TokenType.reward
                                                                ? route.toToken
                                                                : route.fromToken
                                                            ).address.toLowerCase()
                                                        ]
                                                    }
                                                    alt="Token Image"
                                                    className="rounded-full"
                                                />
                                                <span>
                                                    {
                                                        (ucfTokenType ==
                                                        TokenType.reward
                                                            ? route.toToken
                                                            : route.fromToken
                                                        ).symbol
                                                    }
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
