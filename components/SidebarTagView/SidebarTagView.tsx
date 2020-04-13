import React, { FunctionComponent } from 'react'

import styles from './SidebarTagView.module.scss'
import { useStores } from '@stores'
import { Avatar, Button, Divider, Icon } from 'antd'
import { observer } from 'mobx-react-lite'
import { Link, useHistory, useLocation } from 'react-router-dom'
import Markdown from 'markdown-to-jsx'
import cx from 'classnames'

interface ISidebarTagViewProps {}

const SidebarTagView: FunctionComponent<ISidebarTagViewProps> = () => {
    const { tagStore, userStore } = useStores()
    const history = useHistory()
    const location = useLocation()

    if (location.pathname.indexOf('/tag/') !== -1) {
        // get the name
        let [, , tag] = location.pathname.split('/')
        tag = tag.trim().toLowerCase()
        const tagObj = tagStore.tagModelFromObservables(tag)

        return (
            <div className={'pa4 bg-white list card mb3'}>
                <div className={'flex flex-row items-center justify-between'}>
                    <div className={'flex flex-row items-center'}>
                        <span className={'pr3 dib'}>
                            <Avatar src={tagObj.logo} size={'large'} />
                        </span>
                        <span>
                            <Link to={`/tag/${tag}`}>
                                <span className={'f5 black db'}>#{tag}</span>
                            </Link>
                            {typeof tagObj.memberCount !== 'undefined' && (
                                <span className={'f6 db gray'}>{tagObj.memberCount} members</span>
                            )}
                        </span>
                    </div>

                    {tagObj.tagDescription && (
                        <Markdown className={cx(['f6 w5', styles.tagDescription])}>
                            {tagObj.tagDescription}
                        </Markdown>
                    )}

                    <div className={'flex flex-row items-center'}>
                        <Button
                            className={'mr2'}
                            onClick={() => {
                                tagStore.toggleSubscribe(tag)
                                userStore.syncDataFromLocalToServer()
                            }}
                        >
                            {tagStore.subscribed.indexOf(tag) !== -1 ? 'Unsubscribe' : 'Subscribe'}
                        </Button>
                        <Button type={'primary'} onClick={() => history.push(`/new/${tag}`)}>
                            Create Post
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return <div className={'h1 db'} />
}

SidebarTagView.defaultProps = {}

export default observer(SidebarTagView)
