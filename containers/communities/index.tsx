import React, { useCallback } from 'react'
import Helmet from 'react-helmet'
import { RootStore, useStores } from '@stores'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react'
import cx from 'classnames'
import Markdown from 'markdown-to-jsx'

import styles from './styles.module.scss'
import { Button, Spin } from 'antd'

export default observer(() => {
    const { tagStore, authStore, userStore, settingStore }: RootStore = useStores()

    const onSubscribe = useCallback(subscribed => {
        tagStore.addSubscribed(subscribed)
        if (authStore.hasAccount) {
            userStore.syncDataFromLocalToServer()
        }
    }, [])

    const onUnsubscribe = useCallback(subscribed => {
        tagStore.removeSubscribed(subscribed)
        if (authStore.hasAccount) {
            userStore.syncDataFromLocalToServer()
        }
    }, [])

    if (!settingStore.settingsLoaded) {
        return (
            <div className={'bg-white card w-100 h5 flex justify-center items-center'}>
                <Spin />
            </div>
        )
    }

    return (
        <>
            <Helmet>
                <title>{'Trending Tags'}</title>
            </Helmet>
            <div className={'w-100'}>
                {[...tagStore.tags.toJS()].map(([tag, tagModel]) => {
                    return (
                        <div
                            key={tag}
                            className={
                                'card bg-white pa2 mb2 lh-copy flex flex-row items-center justify-between'
                            }
                        >
                            <span className={'flex flex-row items-center w4'}>
                                <img
                                    className={'dib'}
                                    src={tagModel.logo}
                                    alt={`${tag} icon`}
                                    width={25}
                                />
                                <span className={'ml2 dib'}>
                                    <span className={'db'}>
                                        <Link to={`/tag/${tag}`}>
                                            <span className={'f5 black db'}>#{tag}</span>
                                        </Link>
                                    </span>
                                    {typeof tagModel.memberCount !== 'undefined' && (
                                        <span className={'f7 db gray'}>
                                            {tagModel.memberCount} members
                                        </span>
                                    )}
                                </span>
                            </span>
                            <span className={'w5 tl'}>
                                {typeof tagModel.tagDescription !== 'undefined' ? (
                                    <Markdown className={cx(['f6', styles.tagDescription])}>
                                        {tagModel.tagDescription}
                                    </Markdown>
                                ) : (
                                    '--'
                                )}
                            </span>
                            <span className={'w4 tr'}>
                                {tagStore.subscribed.indexOf(tag) !== -1 ? (
                                    <Button
                                        type={'default'}
                                        size={'default'}
                                        className={styles.button}
                                        onClick={() => onUnsubscribe(tag)}
                                    >
                                        Following
                                    </Button>
                                ) : (
                                    <Button
                                        type={'primary'}
                                        icon={'plus'}
                                        size={'default'}
                                        className={styles.button}
                                        onClick={() => onSubscribe(tag)}
                                    >
                                        Follow
                                    </Button>
                                )}
                            </span>
                        </div>
                    )
                })}
            </div>
        </>
    )
})
