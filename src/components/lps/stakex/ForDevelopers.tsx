import { InnerContainer, OuterContainer } from './Container'
import { YouTubeEmbed } from '@next/third-parties/google'

export const ForDevelopers = () => {
    return (
        <OuterContainer className="bg-dapp-blue-800/30">
            <InnerContainer className="flex flex-col gap-8 py-16 md:flex-row">
                <div className="flex flex-col gap-8">
                    <h2 className="font-title text-2xl font-bold">
                        For Developers, Project Owners and Managers
                    </h2>
                    {/* <YouTubeEmbed /> */}
                </div>
            </InnerContainer>
        </OuterContainer>
    )
}
