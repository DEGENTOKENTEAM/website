import { InnerContainer, OuterContainer } from './Container'
import { YouTubeEmbed } from '@next/third-parties/google'

export const ForDevelopers = () => {
    return (
        <OuterContainer className="bg-dapp-blue-800/30">
            <InnerContainer className="flex flex-col gap-8 py-16 md:flex-row">
                <div className="flex w-full flex-col gap-8">
                    <h2 className="text-center font-title text-2xl font-bold">
                        For Developers, Project Owners and Managers
                    </h2>
                    <div className="w-full [&_lite-youtube]:m-auto">
                        <YouTubeEmbed videoid="zbJcSihzXaU" params="controls=1" />
                    </div>
                </div>
            </InnerContainer>
        </OuterContainer>
    )
}
