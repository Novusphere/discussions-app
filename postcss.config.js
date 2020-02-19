const purgecss = require('@fullhuman/postcss-purgecss')
const path = require('path')
const glob = require('glob-all')

const paths = {
    src: path.join(__dirname, '.'),
    public: path.join(__dirname, 'static'),
}

module.exports = ({ webpack }) => {
    const mode = webpack.mode
    const plugins = [
        require('postcss-import')(),
        require('postcss-preset-env')({
            autoprefixer: { grid: true },
        }),
    ]
    if (mode !== 'development') {
        plugins.push(
            purgecss({
                content: glob.sync([`${paths.src}/**/*`, `${paths.public}/**/*`], { nodir: true }),
            })
        )
    }
    return {
        plugins,
    }
}
