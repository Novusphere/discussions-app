const path = require('path')

const resolve = dir => {
    return path.resolve(process.cwd(), dir)
}

module.exports = {
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
}
