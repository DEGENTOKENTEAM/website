import clsx from 'clsx'
import Image from 'next/image'
import { PropsWithChildren } from 'react'
import { Spinner } from '../elements/Spinner'

export type StakingProjectLogoProps = PropsWithChildren & {
    projectName: string
    source: string
    className?: string
    isPending?: boolean
    isLite?: boolean
}

export const StakingProjectLogo = ({
    source,
    projectName,
    className,
    isPending,
    isLite,
}: StakingProjectLogoProps) => {
    return (
        <div className={clsx(['relative flex flex-nowrap gap-4', className])}>
            <div
                className={clsx([
                    isLite
                        ? 'h-[50px] min-h-[50px] w-[50px] min-w-[50px]'
                        : 'h-[100px] min-h-[100px] w-[100px] min-w-[100px]',
                ])}
            >
                {(!source || isPending) && (
                    <div
                        className={`absolute left-0 top-0 flex h-[100px] w-[100px] flex-col items-center justify-center gap-2 rounded-full bg-dapp-blue-200`}
                    >
                        <Spinner theme="dark" />
                        {isPending && (
                            <span className="text-center text-xs font-bold">
                                available
                                <br />
                                soon
                            </span>
                        )}
                    </div>
                )}
                {source && (
                    <Image
                        src={source}
                        alt="Project Logo"
                        className={`rounded-full bg-dapp-blue-400 shadow-md shadow-dapp-blue-800 ${
                            isPending && 'opacity-10'
                        }`}
                        width={100}
                        height={100}
                    />
                )}
            </div>

            <div className="flex items-center">
                <div>
                    <div className="font-title text-xl font-bold">
                        {projectName}
                    </div>
                    {!isLite && (
                        <div className="flex items-end justify-end gap-1 font-title text-xs tracking-wider">
                            provided by
                            <span className="text-lg font-bold leading-none ">
                                <span className="text-techGreen">STAKE</span>
                                <span className="text-degenOrange">X</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
