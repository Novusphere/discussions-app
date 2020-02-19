import React, { FunctionComponent } from 'react'

import styles from './SidebarLinks.module.scss'
import cx from 'classnames'
import { Button, Divider, Icon, Input, Popover } from 'antd'
import { useObserver } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import { Link, useHistory, useLocation } from 'react-router-dom'

interface ISidebarTopLevelLinksProps {}

const SidebarLinks: FunctionComponent<ISidebarTopLevelLinksProps> = () => {
    const history = useHistory()
    const location = useLocation()

    const { tagStore, userStore, authStore }: RootStore = useStores()

    const linkClassName = (link: string) =>
        cx([
            'ph3 pv1',
            {
                'bg-near-white': link === location.pathname,
            },
        ])

    return (
        <>
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
            {![...tagStore.subscribed.toJS()].length && (
                <span className={'f6 light-silver ph3'}>Add a #tag to see more posts!</span>
            )}
            {useObserver(() => (
                <div className={'mt3 db'}>
                    {[...tagStore.subscribed.toJS()].map(subscribed => {
                        const tag: any = tagStore.tagModelFromObservables(subscribed)

                        if (!tag) return null

                        return (
                            <li key={subscribed} className={linkClassName(`/tag/${tag.name}`)}>
                                <Popover
                                    content={
                                        <div className={'pa1 w5'}>
                                            <span
                                                className={
                                                    'f5 flex flex-row items-center justify-between'
                                                }
                                            >
                                                <span className={'flex flex-row items-center'}>
                                                    <img
                                                        className={'dib'}
                                                        src={tag.logo}
                                                        alt={`${subscribed} icon`}
                                                        width={45}
                                                    />
                                                    <span className={'ml3 dib'}>
                                                        <span className={'b db'}>
                                                            <Link to={`/tag/${subscribed}`}>
                                                                <span className={'f5 black db'}>
                                                                    #{subscribed}
                                                                </span>
                                                            </Link>
                                                        </span>
                                                        {typeof tag.memberCount !== 'undefined' && (
                                                            <span className={'f6 db gray'}>
                                                                {tag.memberCount} members
                                                            </span>
                                                        )}
                                                    </span>
                                                </span>
                                                <Button
                                                    onClick={() => {
                                                        tagStore.removeSubscribed(subscribed)
                                                        if (authStore.hasAccount) {
                                                            userStore.syncDataFromLocalToServer()
                                                        }
                                                    }}
                                                    shape="circle"
                                                >
                                                    <Icon type="delete" />
                                                </Button>
                                            </span>
                                            {tag.tagDescription && (
                                                <>
                                                    <Divider />
                                                    <span className={'f6'}>
                                                        {tag.tagDescription}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    }
                                    placement={'right'}
                                    overlayClassName={styles.tagOverlay}
                                >
                                    <Link to={`/tag/${subscribed}`}>
                                        <span className={'dib'}>
                                            <img
                                                className={'dib'}
                                                src={tag.logo}
                                                alt={`${subscribed} icon`}
                                                width={25}
                                            />
                                            <span className={'dib mh2'}>#{subscribed}</span>
                                        </span>
                                    </Link>
                                </Popover>
                            </li>
                        )
                    })}
                </div>
            ))}
        </>
    )
}

SidebarLinks.defaultProps = {}

export default SidebarLinks
