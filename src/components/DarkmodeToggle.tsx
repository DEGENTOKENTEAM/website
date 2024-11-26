import clsx from 'clsx'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/**
 * Always use dark mode for now
 */
export const DarkmodeToggle = () => {
    const [ready, setReady] = useState(false)
    const { theme, setTheme } = useTheme()

    const updateLightmode = () => {
        if (theme === 'light') {
            setTheme('dark')
        } else {
            setTheme('light')
        }
    }

    useEffect(() => {
        setTheme('dark')
        // if (
        //     (theme === 'system' &&
        //         window.matchMedia &&
        //         window.matchMedia('(prefers-color-scheme: dark)').matches) ||
        //     theme === '"default"'
        // ) {
        //     setTheme('dark')
        // }

        setReady(true)
    }, [theme, setTheme])

    if (!ready) {
        return null
    }

    return null;

    return (
        <button
            id="theme-toggle"
            type="button"
            onClick={updateLightmode}
            className="rounded-full p-2.5  text-light-800 transition-colors hover:bg-degenOrange hover:text-light-100  dark:text-light-200 dark:hover:bg-activeblue"
        >
            <svg
                id="theme-toggle-dark-icon"
                className={clsx(`size-5`, theme === 'dark' && 'hidden')}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
            <svg
                id="theme-toggle-light-icon"
                className={clsx(`size-5`, theme === 'light' && 'hidden')}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    fillRule="evenodd"
                    clipRule="evenodd"
                ></path>
            </svg>
        </button>
    )
}
