import * as React from 'react'
import { Route, Switch } from 'react-router-dom'
import { Layout } from '@components'
import { Spin } from 'antd'

const { lazy, Suspense } = React

const HomePage = lazy(() => import('@containers/index/index'))
const AllPage = lazy(() => import('@containers/all'))
const FeedPage = lazy(() => import('@containers/feed'))
const NewPage = lazy(() => import('@containers/new'))
const SearchPage = lazy(() => import('@containers/search'))
const SettingsViewPage = lazy(() => import('@containers/settings'))
const TagViewPage = lazy(() => import('@containers/tag'))
const ThreadViewPage = lazy(() => import('@containers/tag/post'))
const TagsViewPage = lazy(() => import('@containers/tags'))
const UserViewPage = lazy(() => import('@containers/u'))
const NotificationsPage = lazy(() => import('@containers/notifications'))
const NotFoundPage = lazy(() => import('@containers/404'))
const CommunitiesPage = lazy(() => import('@containers/communities'))

export const routes = [
    {
        path: '/',
        exact: true,
        component: HomePage,
    },
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
        path: '/new/:tag?',
        exact: true,
        component: NewPage,
    },
    {
        path: '/search/:query',
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
        path: '/tag/:tag/:id/:title?',
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
    {
        path: '/notifications',
        exact: true,
        component: NotificationsPage,
    },
    {
        path: '/404',
        exact: true,
        component: NotFoundPage,
    },
    {
        path: '/communities',
        exact: true,
        component: CommunitiesPage,
    }
]

const Routes = () => (
    <Suspense
        fallback={
            <Layout>
                <Spin />
            </Layout>
        }
    >
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
