import React, { FunctionComponent, useCallback, useState } from 'react'

import styles from './SidebarLinks.module.scss'
import cx from 'classnames'
import { SidebarLinkPopup } from '@components'
import { Divider, Icon, Input } from 'antd'
import { Observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import { Link, useLocation } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'

interface ISidebarTopLevelLinksProps {
    onMyTagClick: () => void
}

const SidebarLinks: FunctionComponent<ISidebarTopLevelLinksProps> = ({ onMyTagClick }) => {
    const location = useLocation()
    const isMobile = useMediaQuery({ maxWidth: 767 })

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

    const [newTag, addNewTag] = useState(null)

    const onPressEnter = useCallback(() => {
        if (newTag) {
            tagStore.addSubscribed(newTag)
            if (authStore.hasAccount) {
                userStore.syncDataFromLocalToServer()
            }
            addNewTag(null)
        }
    }, [newTag])

    const onChange = useCallback(
        e => {
            addNewTag(e.target.value)
        },
        [newTag]
    )

    return (
        <div className={'bg-white list card mb3 pv3'}>
            <li className={linkClassName('/')} key="1">
                <Link
                    to={'/'}
                    onClick={() => {
                        if (isMobile) {
                            onMyTagClick()
                        }
                    }}
                >
                    <Icon className={'pr2'} type="home" />
                    Home
                </Link>
            </li>
            <li className={linkClassName('/feed')} key="2">
                <Link
                    to={'/feed'}
                    onClick={() => {
                        if (isMobile) {
                            onMyTagClick()
                        }
                    }}
                >
                    <Icon className={'pr2'} type="team" />
                    Feed
                </Link>
            </li>
            <li className={linkClassName('/all')} key="3">
                <Link
                    to={'/all'}
                    onClick={() => {
                        if (isMobile) {
                            onMyTagClick()
                        }
                    }}
                >
                    <Icon className={'pr2'} type="read" />
                    All
                </Link>
            </li>
            <Observer>
                {() => {
                    if (tagStore.tagGroup.size) {
                        return (
                            <>
                                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                                {[...tagStore.tagGroup.entries()].map(([name, tags]) => {
                                    const _name = name.toLowerCase()
                                    const as = `/tags/${tags.join(',')}`
                                    return (
                                        <li className={cx(['ph3 pv1'])} key={_name}>
                                            <Link
                                                to={as}
                                                onClick={() => {
                                                    if (isMobile) {
                                                        onMyTagClick()
                                                    }
                                                }}
                                            >
                                                {name}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </>
                        )
                    }
                    return null
                }}
            </Observer>
            <div className={'pa3 db'}>
                <Input
                    size={'default'}
                    allowClear
                    addonAfter={<Icon type="plus" theme={'outlined'} onClick={onPressEnter} />}
                    placeholder={'Add a tag to subscribe'}
                    value={newTag}
                    onChange={onChange}
                    onPressEnter={onPressEnter}
                />
            </div>
            {![...tagStore.subscribed].length && (
                <span className={'f6 light-silver ph3'}>Add a #tag to see more posts!</span>
            )}
            <Observer>
                {() => (
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
                                        onMyTagClick={onMyTagClick}
                                        isMobile={isMobile}
                                    />
                                </li>
                            )
                        })}
                    </div>
                )}
            </Observer>
        </div>
    )
}

SidebarLinks.defaultProps = {}

export default SidebarLinks
