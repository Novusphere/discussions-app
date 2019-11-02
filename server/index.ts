import next from 'next'

const express = require('express')
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = express()

    server.get('/u/:username', (req, res) => {
        return app.render(req, res, '/u', { username: req.params.username })
    })

    server.get('/tag/:name', (req, res) => {
        return app.render(req, res, '/tag', { name: req.params.name })
    })

    server.get('/e/:tag/:id/:title', async (req, res) => {
        return app.render(req, res, '/e', {
            tag: req.params.tag,
            id: req.params.id,
            title: req.params.title,
        })
    })

    server.all('*', (req, res) => {
        return handle(req, res)
    })

    server.listen(port, err => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${port}`)
    })
})
