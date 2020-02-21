import React from 'react'
import { renderToString } from 'react-dom/server'
import Helmet from 'react-helmet'
import App from '@containers/app'

const express = require('express')
const path = require('path')
const app = express()

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, './dist')))

app.get('/*', (req, res) => {
    const app = renderToString(<App/>)
    const helmet = Helmet.renderStatic()

    res.send(formatHTML(app, helmet))
})

const port = process.env.PORT || 3000
app.listen(port)

function formatHTML(appStr, helmet) {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
      </head>
      <body>
        <div id="root">
          ${appStr}
        </div>
        <script src="./bundle.js"></script>
      </body>
    </html>
  `
}

console.log('App is listening on port ' + port)
