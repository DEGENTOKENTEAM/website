import { TokenInfo, TokenInfoResponse } from '@dapptypes'
import clsx from 'clsx'

type StakingPayoutTokenSelectionProps = {
    tokens: TokenInfoResponse[]
    selectedToken: TokenInfo
    onSelect: (token: TokenInfoResponse) => void
    headline?: string
    description?: string
}

export const StakingPayoutTokenSelection = ({
    tokens,
    selectedToken,
    onSelect,
    headline = 'Payout Token',
    description = 'Choose the token you want to receive as reward',
}: StakingPayoutTokenSelectionProps) => {
    return (
        <div>
            <div className="mb-2">
                <div>{headline}</div>
                {description && (
                    <div className="text-xs text-darkTextLowEmphasis">
                        {description}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-2">
                {tokens &&
                    tokens.length > 0 &&
                    tokens.map((token) => (
                        <button
                            key={`k${token.source}`}
                            className={clsx(
                                'flex flex-col items-center rounded-lg border border-solid bg-dapp-blue-400 px-6 py-2 leading-6',
                                selectedToken?.source == token.source
                                    ? 'border-dapp-cyan-500'
                                    : 'border-dapp-blue-400'
                            )}
                            onClick={() => onSelect(token)}
                        >
                            {token.symbol}
                        </button>
                    ))}
            </div>
        </div>
    )
}
