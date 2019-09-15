// tslint:disable-next-line:no-var-requires
const routes = require('next-routes')

/**
 * Pattern:
 * routes.add([name], pattern = /name, page = name)
 */
export const Routes = routes()
    .add('e', '/e/:tag/:id?/:title?')
    .add('u', '/u/:username')
    .add('tag', '/tag/:name')
    .add('settings', '/settings')
    .add('notifications', '/notifications')
    .add('new', '/new')
    .add('search', '/search')

export const Link = Routes.Link

export const Router = Routes.Router
