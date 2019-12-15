// next.config.js
const withSass = require('@zeit/next-sass')
const withCSS = require('@zeit/next-css')
const webpack = require('webpack')

module.exports = withCSS(
    withSass({
        generateBuildId: async () => {
            return String(Date.now())
        },
        generateEtags: false,
        webpack: (config, options) => {
            config.module.rules.push({
                test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 100000,
                        name: '[name].[ext]',
                    },
                },
            })

            config.plugins.push(
                new webpack.DefinePlugin({
                    'process.env.BUILD_ID': JSON.stringify(options.buildId),
                })
            )

            return config
        },
    })
)
