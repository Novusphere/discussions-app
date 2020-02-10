import React, { FunctionComponent } from 'react'

import styles from './SidebarLinks.module.scss'
import cx from 'classnames'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button, Divider, Icon, Input, Popover } from 'antd'
import { useObserver } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'

interface ISidebarTopLevelLinksProps {}

const SidebarLinks: FunctionComponent<ISidebarTopLevelLinksProps> = () => {
    const router = useRouter()
    const { tagStore, userStore }: RootStore = useStores()

    const linkClassName = link =>
        cx([
            'ph3 pv1',
            {
                'bg-near-white': link === router.asPath,
            },
        ])

    return (
        <>
            <li className={linkClassName('/')} key="1">
                <Link href={'/'} as={'/'}>
                    <a>
                        <Icon className={'pr2'} type="home" />
                        Home
                    </a>
                </Link>
            </li>
            <li className={linkClassName('/feed')} key="2">
                <Link href={'/feed'} as={'/feed'}>
                    <a>
                        <Icon className={'pr2'} type="team" />
                        Feed
                    </a>
                </Link>
            </li>
            <li className={linkClassName('/all')} key="3">
                <Link href={'/all'} as={'/all'}>
                    <a>
                        <Icon className={'pr2'} type="read" />
                        All
                    </a>
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
                                        <Link href={`/tags/[tags]`} as={as} shallow={false}>
                                            <a>{name}</a>
                                        </Link>
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
                        userStore.syncDataFromLocalToServer()
                    }}
                />
            </div>
            {useObserver(() => (
                <div className={'mt3 db'}>
                    {[...tagStore.subscribed.toJS()].map(subscribed => {
                        const tag: any = tagStore.tagModelFromObservables(subscribed)

                        if (!tag) return null

                        return (
                            <li key={subscribed} className={linkClassName(`/tag/${tag.name}`)}>
                                <Popover
                                    content={
                                        <div className={'pa1'}>
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
                                                            <Link
                                                                href={'/tag/[name]'}
                                                                as={`/tag/${subscribed}`}
                                                            >
                                                                <a className={'f5 black db'}>
                                                                    #{subscribed}
                                                                </a>
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
                                                        userStore.syncDataFromLocalToServer()
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
                                    <span>
                                        <Link
                                            href={`/tag/[name]`}
                                            as={`/tag/${subscribed}`}
                                            shallow={false}
                                        >
                                            <a className={'dib'}>
                                                <img
                                                    className={'dib'}
                                                    src={tag.logo}
                                                    alt={`${subscribed} icon`}
                                                    width={25}
                                                />
                                                <span className={'dib mh2'}>#{subscribed}</span>
                                            </a>
                                        </Link>
                                    </span>
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
