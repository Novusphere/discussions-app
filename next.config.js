// const withStyles = require('@webdeb/next-styles')
//
// module.exports = withStyles({
//     sass: true,
//     modules: true,
//     sassLoaderOptions: {
//         data: `
//             @import "_variables.scss";
//         `,
//         includePaths: ['./assets'],
//     },
// })

const withCss = require('@zeit/next-css')
const withSass = require('@zeit/next-sass')
const withLess = require('@zeit/next-less')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin')
const fs = require('fs')
const path = require('path')
const lessToJS = require('less-vars-to-js')
const webpack = require('webpack')

const themeVariables = lessToJS(
    fs.readFileSync(path.resolve(__dirname, './assets/antd-custom.less'), 'utf8')
)

module.exports = withCss(
    withSass({
        cssModules: true,
        ...withLess({
            // dir: 'src',
            // distDir: '../build',
            cssLoaderOptions: {
                importLoaders: 1,
                localIdentName: '[folder]_[local]___[hash:base64:5]',
            },
            lessLoaderOptions: {
                javascriptEnabled: true,
                modifyVars: themeVariables,
            },
            sassLoaderOptions: {
                prependData: `
                    @import "_variables.scss";
                `,
                sassOptions: {
                    includePaths: ['./assets'],
                },
            },
            generateBuildId: async () => {
                return String(Date.now())
            },
            webpack(config, options) {
                if (options.isServer) {
                    config.plugins.push(
                        new ForkTsCheckerWebpackPlugin({
                            tsconfig: './tsconfig.json',
                        })
                    )

                    config.plugins.push(
                        new FilterWarningsPlugin({
                            exclude: /mini-css-extract-plugin[^]*Conflicting order between:/,
                        })
                    );

                    config.plugins.push(
                        new webpack.DefinePlugin({
                            'process.env.BUILD_ID': JSON.stringify(options.buildId),
                        })
                    )

                    const antStyles = /antd\/.*?\/style.*?/
                    const origExternals = [...config.externals]
                    config.externals = [
                        (context, request, callback) => {
                            if (request.match(antStyles)) return callback()
                            if (typeof origExternals[0] === 'function') {
                                origExternals[0](context, request, callback)
                            } else {
                                callback()
                            }
                        },
                        ...(typeof origExternals[0] === 'function' ? [] : origExternals),
                    ]

                    config.module.rules.unshift({
                        test: antStyles,
                        use: 'null-loader',
                    })
                }

                return config
            },
        }),
    })
)
