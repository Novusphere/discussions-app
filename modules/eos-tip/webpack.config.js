const path = require('path')

const config = {
    entry: './modules/eos-tip/src/eos.tip.js',
    output: {
        filename: 'eos-tip.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'QuillMention',
        libraryTarget: 'umd',
    },
    target: 'web',
    // externals: {
    //     quill: {
    //         commonjs: 'quill',
    //         commonjs2: 'quill',
    //         amd: 'quill',
    //         root: 'Quill',
    //     },
    // },
    module: {
        rules: [
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            {
                test: /\.js$/,
                include: [
                    path.join(__dirname, 'src'), // + any other paths that need to be transpiled
                    /\/node_modules\/quill/,
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        browsers: [
                                            'last 2 Chrome major versions',
                                            'last 2 Firefox major versions',
                                            'last 2 Safari major versions',
                                            'last 2 Edge major versions',
                                            'last 2 iOS major versions',
                                            'last 2 ChromeAndroid major versions',
                                        ],
                                    },
                                },
                            ],
                        ],
                    },
                },
            },
        ],
    },
}

module.exports = config
