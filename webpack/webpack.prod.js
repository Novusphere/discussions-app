// 'use strict'
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.js')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
// const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
//
// const _PROD_ = process.env.NODE_ENV === 'production'
//
// const webpackConfig = merge(baseWebpackConfig, {
//     mode: 'production',
//     devtool: false,
//     plugins: [
//         new CleanWebpackPlugin({
//             cleanAfterEveryBuildPatterns: ['dist'],
//             root: path.resolve(__dirname, '../'),
//         }),
//         new OptimizeCSSAssetsPlugin({
//             // cssProcessor: require('cssnano')({ autoprefixer: false })
//         }),
//         new UglifyJsPlugin({
//             uglifyOptions: {
//                 compress: {
//                     warnings: false,
//                     drop_console: _PROD_,
//                 },
//                 output: {
//                     comments: false,
//                 },
//             },
//             parallel: true,
//         }),
//         new HtmlWebpackPlugin({
//             title: 'Discussions App',
//             filename: 'index.html',
//             template: path.resolve(__dirname, '../static/index.html'),
//             inject: true,
//             minify: {
//                 minifyJS: true,
//                 removeComments: true,
//                 collapseWhitespace: true,
//                 removeAttributeQuotes: true,
//             },
//         }),
//         // keep modules.id stable when vendor modules does not change
//         new webpack.HashedModuleIdsPlugin(),
//     ],
// })
//
// module.exports = webpackConfig

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
// const RobotstxtPlugin = require('robotstxt-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = merge(baseWebpackConfig, {
    mode: 'production',
    devtool: false,
    output: {
        path: __dirname + '../dist',
        publicPath: '/',
        filename: '[name].[hash].js',
    },
    plugins: [
        new CleanWebpackPlugin(),
        // new RobotstxtPlugin({}),
        // new BundleAnalyzerPlugin({
        //     analyzerMode: 'static',
        //     openAnalyzer: false
        // })
        new webpack.ProgressPlugin(),
    ],
    optimization: {
        minimizer: [
            new OptimizeCSSAssetsPlugin(),
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    ecma: 6,
                },
            }),
        ],
        splitChunks: {
            chunks: 'async',
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                vendors: {
                    chunks: 'initial',
                    name: 'vendor',
                    test: 'vendor',
                    enforce: true,
                },
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true,
                },
            },
        },
    },
})
