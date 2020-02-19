const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const _DEV_ = process.env.NODE_ENV === 'development'
const lessToJS = require('less-vars-to-js')
const fs = require('fs')
const path = require('path')

const themeVariables = lessToJS(
    fs.readFileSync(path.resolve(__dirname, '../assets/theme.less'), 'utf8')
)

const styleRules = [
    {
        test: /\.less$/,
        use: [
            {
                loader: 'style-loader',
            },
            {
                loader: 'css-loader', // translates CSS into CommonJS
            },
            {
                loader: 'less-loader', // compiles Less to CSS
                options: {
                    modifyVars: themeVariables,
                    javascriptEnabled: true,
                },
            },
        ],
    },
    { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    {
        test: /\.module\.s(a|c)ss$/,
        use: [
            {
                loader: MiniCssExtractPlugin.loader,
                options: {
                    hmr: _DEV_,
                },
            },
            {
                loader: 'css-loader',
                options: {
                    modules: true,
                },
            },
            {
                loader: 'postcss-loader',
            },
            {
                loader: 'sass-loader',
            },
        ],
    },
    {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        use: [
            {
                loader: MiniCssExtractPlugin.loader,
                options: {
                    hmr: _DEV_,
                },
            },
            {
                loader: 'css-loader',
            },
            {
                loader: 'postcss-loader',
            },
            {
                loader: 'sass-loader',
            },
        ],
    },
]

module.exports = styleRules
