const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const _DEV_ = process.env.NODE_ENV === 'development'
const lessToJS = require('less-vars-to-js')
const fs = require('fs')
const path = require('path')

const themeVariables = lessToJS(
    fs.readFileSync(path.resolve(__dirname, '../assets/theme.less'), 'utf8')
)

const styleRules = [
    // {
    //     test: /\.less$/,
    //     use: [
    //         {
    //             loader: 'style-loader',
    //         },
    //         {
    //             loader: 'css-loader', // translates CSS into CommonJS
    //         },
    //         {
    //             loader: 'less-loader', // compiles Less to CSS
    //             options: {
    //                 modifyVars: themeVariables,
    //                 javascriptEnabled: true,
    //             },
    //         },
    //     ],
    // },
    // { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    {
        test: /\.module\.s(a|c)ss$/,
        use: [
            { loader: MiniCssExtractPlugin.loader },
            {
                loader: 'css-loader',
                options: {
                    sourceMap: false,
                    modules: {
                        localIdentName: '[name]_[local]_[hash:base64:5]',
                    }
                },
            },
            { loader: 'sass-loader' },
        ],
    },
    {
        // test: /\.(scss|sass|css)$/,
        test: /\.(s(a|c)|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { url: false, sourceMap: true } },
            {
                loader: 'sass-loader',
                options: { sourceMap: true },
            },
        ],
    },
    {
        test: /\.(less)$/,
        use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { url: false, sourceMap: true } },
            {
                loader: 'less-loader',
                options: { javascriptEnabled: true, modifyVars: themeVariables },
            },
        ],
    },
    // {
    //     test: /\.s(a|c)ss$/,
    //     exclude: /\.module.(s(a|c)ss)$/,
    //     use: [
    //         {
    //             loader: MiniCssExtractPlugin.loader,
    //             options: {
    //                 hmr: _DEV_,
    //             },
    //         },
    //         {
    //             loader: 'css-loader',
    //         },
    //         {
    //             loader: 'postcss-loader',
    //         },
    //         {
    //             loader: 'sass-loader',
    //         },
    //     ],
    // },
]

module.exports = styleRules
