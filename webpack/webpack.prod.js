const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = merge(baseWebpackConfig, {
    mode: 'production',
    devtool: false,
    output: {
        path: __dirname + '/../dist',
        publicPath: '/',
        filename: '[name].[hash].js',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.ProgressPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../static', 'template.html'),
            filename: 'app.html',
            favicon: path.resolve(__dirname, '../static', 'favicon.ico'),
            inject: true,
        }),
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
