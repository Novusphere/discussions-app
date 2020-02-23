import { renderToString } from 'react-dom/server'
import App from '@containers/app'
import Helmet from 'react-helmet'
import React from 'react'

module.exports = function(app) {
    app.get('/*', (req, res) => {
        const app = renderToString(<App/>)
        const helmet = Helmet.renderStatic()

        res.send(formatHTML(app, helmet))
    })
}