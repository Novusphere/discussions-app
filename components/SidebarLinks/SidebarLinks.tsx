import React, { FunctionComponent, useCallback } from 'react'

import styles from './SidebarLinks.module.scss'
import cx from 'classnames'
import { SidebarLinkPopup } from '@components'
import { Button, Divider, Icon, Input } from 'antd'
import { useObserver } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import { Link, useLocation } from 'react-router-dom'

interface ISidebarTopLevelLinksProps {}

const SidebarLinks: FunctionComponent<ISidebarTopLevelLinksProps> = () => {
    const location = useLocation()

    const { tagStore, userStore, authStore }: RootStore = useStores()

    const linkClassName = (link: string) =>
        cx([
            'ph3 pv1',
            {
                'bg-near-white': link === location.pathname,
            },
        ])

    const onUnsubscribe = useCallback(subscribed => {
        tagStore.removeSubscribed(subscribed)
        if (authStore.hasAccount) {
            userStore.syncDataFromLocalToServer()
        }
    }, [])

    return (
        <div className={'bg-white list card mb3 pv3'}>
            <li className={linkClassName('/')} key="1">
                <Link to={'/'}>
                    <Icon className={'pr2'} type="home" />
                    Home
                </Link>
            </li>
            <li className={linkClassName('/feed')} key="2">
                <Link to={'/feed'}>
                    <Icon className={'pr2'} type="team" />
                    Feed
                </Link>
            </li>
            <li className={linkClassName('/all')} key="3">
                <Link to={'/all'}>
                    <Icon className={'pr2'} type="read" />
                    All
                </Link>
            </li>
            {useObserver(() => {
                if (tagStore.tagGroup.size) {
                    return (
                        <>
                            <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                            {[...tagStore.tagGroup.entries()].map(([name, tags]) => {
                                const _name = name.toLowerCase()
                                const as = `/tags/${tags.join(',')}`
                                return (
                                    <li className={cx(['ph3 pv1'])} key={_name}>
                                        <Link to={as}>{name}</Link>
                                    </li>
                                )
                            })}
                        </>
                    )
                }
            })}
            <div className={'pa3 db'}>
                <Input
                    size={'default'}
                    allowClear
                    addonAfter={<Icon type="plus" theme={'outlined'} />}
                    placeholder="Add a tag to subscribe"
                    onPressEnter={(e: any) => {
                        tagStore.addSubscribed(e.target.value)
                        if (authStore.hasAccount) {
                            userStore.syncDataFromLocalToServer()
                        }
                    }}
                />
            </div>
            {![...tagStore.subscribed].length && (
                <span className={'f6 light-silver ph3'}>Add a #tag to see more posts!</span>
            )}
            {useObserver(() => (
                <div className={'mt3 db'}>
                    {[...tagStore.subscribed].map(subscribed => {
                        const tag: any = tagStore.tagModelFromObservables(subscribed)
                        if (!tag) return null
                        return (
                            <li key={subscribed} className={linkClassName(`/tag/${tag.name}`)}>
                                <SidebarLinkPopup
                                    subscribed={subscribed}
                                    tag={tag}
                                    onUnsubscribe={onUnsubscribe}
                                />
                            </li>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}

SidebarLinks.defaultProps = {}

export default SidebarLinks
