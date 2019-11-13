// next.config.js
const withSass = require('@zeit/next-sass')
const withCSS = require('@zeit/next-css')

module.exports = withCSS(
    withSass({
        generateBuildId: async () => {
            return String(Date.now())
        },
        generateEtags: false,
        webpack: config => {
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

            return config
        },
    })
)
