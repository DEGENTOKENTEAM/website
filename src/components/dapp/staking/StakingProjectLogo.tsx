import clsx from 'clsx'
import Image from 'next/image'
import { PropsWithChildren } from 'react'
import { Spinner } from '../elements/Spinner'

export type StakingProjectLogoProps = PropsWithChildren & {
    projectName: string
    source: string
    className?: string
}

export const StakingProjectLogo = ({
    source,
    projectName,
    className,
}: StakingProjectLogoProps) => {
    return (
        <div className={clsx(['flex gap-4', className])}>
            {source ? (
                <Image
                    src={source}
                    alt="Project Logo"
                    className="rounded-full bg-dapp-blue-400 shadow-md shadow-dapp-blue-800"
                    width={100}
                    height={100}
                />
            ) : (
                <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-dapp-blue-400">
                    <Spinner theme="dark" />
                </div>
            )}
            <div className="flex items-center">
                <div>
                    <div className="font-title text-xl font-bold">
                        {projectName}
                    </div>
                    <div className="flex items-end justify-end gap-1 font-title text-xs tracking-wider">
                        provided by
                        <span className="text-lg font-bold leading-none ">
                            <span className="text-techGreen">STAKE</span>
                            <span className="text-degenOrange">X</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
