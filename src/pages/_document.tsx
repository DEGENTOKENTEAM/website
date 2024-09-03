import { GoogleTagManager } from '@next/third-parties/google'
import { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document(props) {
    // useRouter isReady forces pre-rendered page to be not pre rendered
    let pageProps = props.__NEXT_DATA__?.props?.pageProps

    return (
        <Html
            className="dark h-full scroll-smooth antialiased [font-feature-settings:'ss01']"
            lang="en"
            style={{ colorScheme: 'dark' }}
        >
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap"
                    rel="stylesheet"
                />
                <Script async type="text/javascript" src="/charting_library/charting_library.js" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
