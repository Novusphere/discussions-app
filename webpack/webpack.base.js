const path = require('path'),
    styleRules = require('./styleLoaderConf'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const resolve = dir => {
    return path.resolve(process.cwd(), dir)
}

module.exports = {
    entry: {
        app: resolve('containers/index.tsx'),
        vendor: ['react', 'react-dom'],
    },
    output: {
        path: resolve('dist'), // string
        publicPath: '/', // root Dir
        sourceMapFilename: '[name].map',
        chunkFilename: 'static/js/[name].[chunkhash:8].js',
        filename: 'static/js/[name].[hash:8].js',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.(j|t)sx?$/,
                include: [resolve('.')],
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                targets: { ie: 9 },
                                ignoreBrowserslistConfig: true,
                                useBuiltIns: false,
                                modules: false,
                                exclude: ['transform-typeof-symbol'],
                            },
                        ],
                        [
                            '@babel/preset-react',
                            {
                                targets: 'last 2 versions, ie 11',
                                modules: false,
                            },
                        ],
                        ['@babel/preset-typescript'],
                    ],
                    plugins: [
                        ['@babel/plugin-transform-runtime'],
                        ['@babel/plugin-syntax-dynamic-import'],
                        ['@babel/plugin-proposal-decorators', { legacy: true }],
                        ['@babel/plugin-proposal-class-properties', { loose: true }],
                    ],
                },
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg|png|jpg|gif)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'assets/',
                        },
                    },
                ],
            },
            ...styleRules,
        ],
    },
    resolve: {
        modules: ['node_modules', resolve('.')],
        extensions: ['.js', '.ts', '.tsx'],
        alias: {
            '@components': resolve('components/index'),
            '@constants': resolve('constants'),
            '@novuspherejs': resolve('novusphere-js'),
            '@stores': resolve('stores'),
            '@modules': resolve('modules'),
            '@styles': resolve('styles'),
            '@utils': resolve('utils'),
            '@routes': resolve('routes'),
            '@containers': resolve('containers'),
            '@globals': resolve('constants/globals'),
            '@static': resolve('static'),
        },
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            ignoreOrder: false,
        }),
    ],
}
