require("@babel/register")({
    presets: ['es2015', 'react']
});

const appGet = require('./_appGet')
const express = require('express')
const path = require('path')
const app = express()

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, './dist')))

appGet(app);

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
