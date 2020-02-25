const path = require('path')
const nodeExternals = require('webpack-node-externals')
const alias = require('./resolve')
const styleRules = require('./styleLoaderConf')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')

const resolve = dir => {
    return path.resolve(process.cwd(), dir)
}

const config = {
    mode: 'production',
    entry: './server/server.ts',
    devtool: 'cheap-module-source-map',
    target: 'node',
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, '../dist'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
            },
            ...styleRules,
        ],
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        alias: alias,
    },
    externals: [nodeExternals()],
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            ignoreOrder: false,
        }),
        new webpack.ProvidePlugin({
            $msg: [resolve('node_modules/antd/es/message/index.js'), 'default'],
        }),
    ],
}

module.exports = config
