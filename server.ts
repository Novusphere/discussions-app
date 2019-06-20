import * as express from 'express'
import * as next from 'next'
import { Routes } from './routes'
const port = 3000
const app = next({ dev: process.env.NODE_ENV !== 'production' })
const handler = Routes.getRequestHandler(app)

app.prepare().then(() => {
	const server = express()

	server.get('*', (req, res) => {
		return handler(req, res)
	})

	server.listen(port, err => {
		if (err) throw err
		console.log(`> Ready on http://localhost:${port}`)
	})
})
