import * as React from 'react'
import { Route, Switch } from 'react-router-dom'
import { Layout } from '@components'

const { lazy, Suspense } = React

const AllPage = lazy(() => import('@containers/all'))
const FeedPage = lazy(() => import('@containers/feed'))
const NewPage = lazy(() => import('@containers/new'))
const SearchPage = lazy(() => import('@containers/search'))
const SettingsViewPage = lazy(() => import('@containers/settings'))
const TagViewPage = lazy(() => import('@containers/tag'))
const ThreadViewPage = lazy(() => import('@containers/tag/post'))
const TagsViewPage = lazy(() => import('@containers/tags'))
const UserViewPage = lazy(() => import('@containers/u'))

export const routes = [
    {
        path: '/all',
        exact: true,
        component: AllPage,
    },
    {
        path: '/feed',
        exact: true,
        component: FeedPage,
    },
    {
        path: '/new',
        exact: true,
        component: NewPage,
    },
    {
        path: '/search',
        exact: true,
        component: SearchPage,
    },
    {
        path: '/settings/:setting',
        exact: true,
        component: SettingsViewPage,
    },
    {
        path: '/tag/:tag',
        exact: true,
        component: TagViewPage,
    },
    {
        path: '/tag/:tag/:id/:title',
        exact: true,
        component: ThreadViewPage,
    },
    {
        path: '/tags/:tags',
        exact: true,
        component: TagsViewPage,
    },
    {
        path: '/u/:username',
        exact: true,
        component: UserViewPage,
    },
]

const Routes = () => (
    <Suspense fallback={<span>Loading...</span>}>
        <Switch>
            <Layout>
                {routes.map(({ path, exact, component: LazyComponent }) => (
                    <Route
                        key={path + ''}
                        exact={!!exact}
                        path={path}
                        render={(props: any) => <LazyComponent {...props} />}
                    />
                ))}
            </Layout>
        </Switch>
    </Suspense>
)

export default Routes
