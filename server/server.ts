import { getSettings, removeMD } from '../utils'
import { discussions } from '../novusphere-js'

const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
const filePath = path.resolve(`${process.cwd()}/dist/app.html`)

// Serve the static files from the React app
app.use(express.static(path.join(process.cwd() + '/dist')))
app.use(async (req, res, next) => {
    res.settings = await getSettings(req.hostname)
    res.genericTagUrl = res.settings.icon || 'https://cdn.novusphere.io/static/atmos.svg'
    next()
})

// https://github.com/nfl/react-helmet/blob/1d21159dbaf0638388c1a81e7e4a60c3fdd18ef9/src/HelmetUtils.js#L14
const encodeSpecialCharacters = (str, encode = true) => {
    if (encode === false) {
        return String(str)
    }

    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
}

const serveAndReplaceMeta = (res, { title, description, image }) => {
    return fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return console.log(err)
        }

        const result = data
            .replace(/\$OG_TITLE/g, encodeSpecialCharacters(title))
            .replace(/\$OG_DESCRIPTION/g, encodeSpecialCharacters(removeMD(description)))
            .replace(/\$OG_IMAGE/g, image)

        res.send(result)
    })
}

app.get('/', (req, res) => {
    serveAndReplaceMeta(res, {
        title: 'Discussions App',
        description: res.settings.description || 'Welcome to Discussions App!',
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

app.get('/new/:tag?', (req, res) => {
    serveAndReplaceMeta(res, {
        title: 'Create a new post',
        description: 'Create a new post',
        image: res.genericTagUrl,
    })
})

app.get('/notifications', (req, res) => {
    serveAndReplaceMeta(res, {
        title: 'Viewing notifications',
        description: 'Viewing your notifications',
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
        description: tagModel.desc || res.settings.description,
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

    const thread = await discussions.getThread(id, '', req.hostname)

    let title = '',
        description = ''

    if (!thread) {
        title = 'Unable to find post'
        description = 'Thread not found'
    } else {
        title = `${thread.openingPost.title} - #${tag}`
        description = (thread.openingPost.content).substring(0, 150)
    }

    serveAndReplaceMeta(res, {
        title: title,
        description: description,
        image: tagModel.icon,
    })
})

app.get('/404', (req, res) => {
    serveAndReplaceMeta(res, {
        title: '404 Not Found',
        description: 'This page is either broken or does not exist',
        image: res.genericTagUrl,
    })
})

app.get('*', (req, res) => {
    res.redirect('/404')
})

const port = process.env.PORT || 3000
app.listen(port)

console.log('App is listening on port ' + port)
