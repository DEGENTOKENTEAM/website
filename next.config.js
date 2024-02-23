/** @type {import('next').NextConfig} */
// const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/dapp/:path*',
        destination: '/dapp/',
      },
    ]
  },
  trailingSlash: true,
  reactStrictMode: process.env.USE_STRICT === 'true',
  experimental: {
    scrollRestoration: true,
  },
  images: {
    unoptimized: true,
  },
}

// const sentryWebpackPluginOptions = {
//   // Additional config options for the Sentry webpack plugin. Keep in mind that
//   // the following options are set automatically, and overriding them is not
//   // recommended:
//   //   release, url, configFile, stripPrefix, urlPrefix, include, ignore

//   org: 'degenx-ecosystem',
//   project: 'degenx-dapp-staging',

//   // An auth token is required for uploading source maps.
//   authToken: process.env.SENTRY_AUTH_TOKEN,

//   silent: true, // Suppresses all logs

//   // For all available options, see:
//   // https://github.com/getsentry/sentry-webpack-plugin#options.
// }

// module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
module.exports = nextConfig
