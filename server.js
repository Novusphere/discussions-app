const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
const filePath = path.join(__dirname + '/dist/index.html')

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, './dist')))
// app.use(async (req, res, next) => {
//     res.settings = await getSettingsAsync(req.host)
//     next()
// })

const serveAndReplaceMeta = (res, {
    title,
    description,
    image,
}) => {
    return fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return console.log(err)
        }

        const result = data.replace(/\$OG_TITLE/g, title)
            .replace(/\$OG_DESCRIPTION/g, description)
            .replace(/\$OG_IMAGE/g, image)

        res.send(result)
    })
}

// Handles any requests that don't match the ones above
app.get('/', (req, res) => {
    serveAndReplaceMeta(res, {
        title: 'Discussions App',
        description: 'Welcome',
        image: '',
    })
})

app.get('/tag/:tag', (req, res) => {
    console.log(res.settings)
    const { tag } = req.params
    serveAndReplaceMeta(res, {
        title: `#${tag}`,
        description: `Viewing posts in ${tag}`,
        image: '',
    })
})

const port = process.env.PORT || 3000
app.listen(port)

console.log('App is listening on port ' + port)
