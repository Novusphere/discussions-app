import { getSettings } from '../utils'

const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
const filePath = path.resolve(`${process.cwd()}/dist/index.html`)

// Serve the static files from the React app
app.use(express.static(path.join(process.cwd() + '/dist')))
app.use(async (req, res, next) => {
    res.settings = await getSettings(req.hostname)
    res.genericTagUrl = 'https://cdn.novusphere.io/static/atmos.svg'
    next()
})

const serveAndReplaceMeta = (res, { title, description, image }) => {
    return fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return console.log(err)
        }

        const result = data
            .replace(/\$OG_TITLE/g, title)
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
    const { tag } = req.params
    let tagModel = res.settings.tags[tag]

    if (typeof tagModel === 'undefined') {
        tagModel = {
            description: `Viewing posts in ${tag}`,
            icon: res.genericTagUrl,
        }
    }

    serveAndReplaceMeta(res, {
        title: `#${tag}`,
        description: tagModel.desc,
        image: tagModel.icon,
    })
})

const port = process.env.PORT || 3000
app.listen(port)

console.log('App is listening on port ' + port)
