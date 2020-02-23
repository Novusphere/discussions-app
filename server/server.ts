import { getSettings, removeMD } from '../utils'
import { discussions } from '../novusphere-js';

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

app.get('/', (req, res) => {
    serveAndReplaceMeta(res, {
        title: 'Discussions App',
        description: 'Welcome to Discussions App!',
        image: res.genericTagUrl,
    })
})

app.get('/all', (req, res) => {
    serveAndReplaceMeta(res, {
        title: '#all',
        description: 'Viewing #all posts',
        image: res.genericTagUrl,
    })
})

app.get('/feed', (req, res) => {
    serveAndReplaceMeta(res, {
        title: '#feed',
        description: 'Viewing #feed posts',
        image: res.genericTagUrl,
    })
})

app.get('/new', (req, res) => {
    serveAndReplaceMeta(res, {
        title: 'Create a new post',
        description: 'Create a new post',
        image: res.genericTagUrl,
    })
})

app.get('/search/:query', (req, res) => {
    const { query } = req.params
    serveAndReplaceMeta(res, {
        title: `Search results: ${query}`,
        description: `Viewing search results for ${query}`,
        image: res.genericTagUrl,
    })
})

app.get('/settings/:setting', (req, res) => {
    const { setting } = req.params
    serveAndReplaceMeta(res, {
        title: `Settings - ${setting}`,
        description: `Viewing settings for ${setting}`,
        image: res.genericTagUrl,
    })
})

app.get('/tags/:tags', (req, res) => {
    const { tags } = req.params
    serveAndReplaceMeta(res, {
        title: `${tags.split(',').map(tag => `#${tag}`)}`,
        description: `Viewing multiple tags ${tags}`,
        image: res.genericTagUrl,
    })
})


app.get('/u/:username', (req, res) => {
    const { username } = req.params
    const [name] = username.split('-')
    serveAndReplaceMeta(res, {
        title: `/u/${name}`,
        description: `Viewing ${name}'s profile`,
        image: res.genericTagUrl,
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

app.get('/tag/:tag/:id/:title', async (req, res) => {
    const { tag, id } = req.params

    let tagModel = res.settings.tags[tag]

    if (typeof tagModel === 'undefined') {
        tagModel = {
            description: `Viewing posts in ${tag}`,
            icon: res.genericTagUrl,
        }
    }

    const thread = await discussions.getThread(id)

    let title = '', description = ''

    if (!thread) {
        title = 'Unable to find post'
        description = 'Thread not found'
    } else {
        title = `${thread.openingPost.title} - #${tag}`
        description = removeMD(thread.openingPost.content).substring(0, 150)
    }

    serveAndReplaceMeta(res, {
        title: title,
        description: description,
        image: tagModel.icon,
    })
})

const port = process.env.PORT || 3000
app.listen(port)

console.log('App is listening on port ' + port)
