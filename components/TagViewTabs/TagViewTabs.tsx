import React, { FunctionComponent, useCallback } from 'react'

import styles from './TagViewTabs.module.scss'
import { Avatar, Button, Tabs } from 'antd'
import cx from 'classnames'
import { RootStore, useStores } from '@stores'
import { observer } from 'mobx-react-lite'
import { useLocation } from 'react-router-dom'
import { Desktop, getIdenticon } from '@utils'
import { Footer } from '@components'

interface ITagViewTabsProps {
    sidebar: any
    content: any
}

const { TabPane } = Tabs

const TagViewTabs: FunctionComponent<ITagViewTabsProps> = ({ sidebar, content }) => {
    const { uiStore, userStore }: RootStore = useStores()
    const location = useLocation()

    const renderSidebar = useCallback(() => {
        return (
            <div
                className={cx([
                    'fl w-30 ml2-ns ml0',
                    {
                        dn: uiStore.hideSidebar,
                        'dn db-ns': !uiStore.hideSidebar,
                    },
                ])}
            >
                {sidebar}

                <Desktop>
                    <Footer className={'o-60 f6'} footerText={uiStore.footerText} />
                </Desktop>
            </div>
        )
    }, [uiStore.footerText])

    const WrapComponent = useCallback(({ children }) => {
        return (
            <div className={'flex flex-row w-100'}>
                <div
                    className={cx([
                        {
                            'w-100': uiStore.hideSidebar,
                            'w-70-ns w-100': !uiStore.hideSidebar,
                        },
                    ])}
                >
                    {children}
                </div>
                {renderSidebar()}
            </div>
        )
    }, [])

    if (location.pathname.indexOf('/tag/') === -1) {
        return <WrapComponent>{content}</WrapComponent>
    }

    const [, , tagName] = location.pathname.split('/')

    const dataSource = [...userStore.delegated.toJS()]
        .filter(([, tag]) => tag === 'all' || tag === tagName)
        .map(([delegated]) => {
            const [name, key, tag] = delegated.split(':')
            return {
                key: delegated,
                name: name,
                tag: tag,
                uidw: key,
            }
        })

    return (
        <Tabs
            defaultActiveKey="1"
            onChange={index => console.log(index)}
            renderTabBar={(props, TabBar) => {
                return (
                    <div className={cx(['card bg-white', styles.container])}>
                        <TabBar {...props} />
                    </div>
                )
            }}
        >
            <TabPane tab="Posts" key="1">
                <WrapComponent>{content}</WrapComponent>
            </TabPane>
            <TabPane tab="Moderators" key="2">
                <div className={'card bg-white pa4'}>
                    <span className={'f4 b black db mb3'}>Your Moderators</span>
                    {dataSource.map(record => {
                        return (
                            <div
                                className={'flex flex-row items-center justify-between mb3 lh-copy'}
                                key={record.uidw}
                            >
                                <span className={'flex flex-row items-center'}>
                                    <Avatar src={getIdenticon(record.uidw)} />
                                    <span className={'flex flex-column mh2'}>
                                        <span className={'f6 b dark-gray'}>{record.name}</span>
                                        <span className={'f6 light-silver'}>#{record.tag}</span>
                                    </span>
                                </span>
                                <Button
                                    size={'small'}
                                    type={'danger'}
                                    key={'unblock'}
                                    onClick={() =>
                                        userStore.setModerationMemberByTag(
                                            `${record.name}:${record.uidw}`,
                                            record.tag
                                        )
                                    }
                                >
                                    remove
                                </Button>
                            </div>
                        )
                    })}
                </div>
                <div className={'card bg-white pa4 mt3'}>
                    <span className={'f4 b black db mb3'}>Candidates</span>
                    <span className={'f6 moon-gray'}>Currently there are no candidates.</span>
                </div>
            </TabPane>
        </Tabs>
    )
}

TagViewTabs.defaultProps = {}

export default observer(TagViewTabs)
