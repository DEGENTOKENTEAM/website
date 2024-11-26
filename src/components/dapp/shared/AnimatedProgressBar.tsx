import { useState } from 'react'
import { useInterval } from 'usehooks-ts'

type AnimatedProgressBarProps = {
    timeFrom: number
    timeTo: number
    now?: number
}
export const AnimatedProgressBar = ({ timeFrom, timeTo, now }: AnimatedProgressBarProps) => {
    const [currentProgress, setCurrentProgress] = useState(
        ((timeTo - (now ? now : Date.now())) / (timeTo - timeFrom)) * 100
    )
    const [updateInterval, setUpdateInterval] = useState(50)
    useInterval(() => {
        if (currentProgress > 100) {
            setCurrentProgress(100)
            setUpdateInterval(0)
        } else setCurrentProgress((1 - (timeTo - (now ? now : Date.now())) / (timeTo - timeFrom)) * 100)
    }, updateInterval)
    return (
        <div className="relative h-2">
            <div className="absolute h-2 w-full bg-[#ad925d]"></div>
            <div className="absolute h-2 bg-[#4aad6b]" style={{ width: `${currentProgress.toFixed(3)}%` }}></div>
        </div>
    )
}
