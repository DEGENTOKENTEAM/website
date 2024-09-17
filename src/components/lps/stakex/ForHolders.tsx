import Link from 'next/link'
import { InnerContainer, OuterContainer } from './Container'
import { YouTubeEmbed } from '@next/third-parties/google'
import clsx from 'clsx'
import { Fragment, useState } from 'react'

export const ForHolders = () => {
    const [currentTab, setCurrentTab] = useState(0)
    const tabs: { title: string; description: string; videoid: string }[] = [
        {
            title: 'Introduction to STAKEX',
            description: 'Get more insights about STAKEX, the perfect staking solution for your project',
            videoid: 'unl8BG_NqXg',
        },
        {
            title: 'How to stake your tokens',
            description: `Get to know how you or your token holders can deposit project tokens into your staking solution`,
            videoid: 'yuipPkm9EWk',
        },
        {
            title: 'How to re-stake your rewards',
            description: `Get to know how your stakers can re-stake their rewards they've received from your staking solution`,
            videoid: 'xBOEP9bvDFc',
        },
        {
            title: 'How to claim your rewards',
            description: `Get to know how your stakers can claim their rewards re-stake from your staking solution`,
            videoid: 'PGfYEnBns5s',
        },
        {
            title: 'How to withdraw your rewards',
            description: 'Get to know how your stakers can withdraw their stake from your staking solution',
            videoid: '4gwoTDM_h9I',
        },
    ]
    return (
        <OuterContainer className="bg-dapp-blue-800/30">
            <InnerContainer className="flex flex-col gap-8 py-16 md:flex-row">
                <div className="flex w-full flex-col gap-8">
                    <div className="md:flex">
                        <ul className="space-y mb-4 space-y-4 font-medium md:mb-0 md:me-4">
                            {tabs.map((tab, i) => (
                                <li key={i} className="md:whitespace-nowrap">
                                    <button
                                        onClick={() => i != currentTab && setCurrentTab(i)}
                                        className={clsx([
                                            'inline-flex w-full items-center rounded-lg border px-4 py-3 hover:bg-dapp-blue-400/70',
                                            i == currentTab
                                                ? 'border-dapp-cyan-50/10 bg-dapp-blue-400/70'
                                                : 'border-dapp-blue-400/30 bg-dapp-blue-400/30',
                                        ])}
                                    >
                                        {tab.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="flex w-full flex-grow flex-col gap-4 rounded-lg bg-dapp-blue-400/70 p-6">
                            <h3 className="text-xl font-bold">{tabs[currentTab].title}</h3>
                            {tabs.map(
                                (tab, i) =>
                                    i == currentTab && (
                                        <Fragment key={i}>
                                            <p>{tab.description}</p>
                                            <YouTubeEmbed videoid={tab.videoid} params="controls=1" />
                                        </Fragment>
                                    )
                            )}
                        </div>
                    </div>
                </div>
            </InnerContainer>
        </OuterContainer>
    )
}
