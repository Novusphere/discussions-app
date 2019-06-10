const routes = require('next-routes')();

routes
	.add('/', '/home/index')    .add('/e/:category/:id/:title', '/threadView/index')

module.exports = routes;