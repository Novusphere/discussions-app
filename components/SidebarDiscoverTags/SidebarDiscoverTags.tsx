import React, { FunctionComponent, useCallback, useEffect } from 'react'

import styles from './SidebarDiscoverTags.module.scss'
import { Icon, Spin } from 'antd'
import { RootStore, useStores } from '@stores'
import { observer } from 'mobx-react'
import { SidebarLinkPopup } from '@components'
import { Link } from 'react-router-dom'

interface ISidebarTrendingTagsProps {}

const SidebarDiscoverTags: FunctionComponent<ISidebarTrendingTagsProps> = observer(() => {
    const { tagStore, userStore, authStore, settingStore }: RootStore = useStores()

    const onSubscribe = useCallback(subscribed => {
        tagStore.addSubscribed(subscribed)
        if (authStore.hasAccount) {
            userStore.syncDataFromLocalToServer()
        }
    }, [])

    if (!settingStore.settingsLoaded) {
        return (
            <div className={'bg-white card w-100 h5 flex justify-center items-center o-50'}>
                <Spin />
            </div>
        )
    }

    return (
        <div className={'pa3 bg-white list card mb3'}>
            <span className={'f5 flex flex-row justify-between items-center'}>
                <span>
                    <Icon type="bulb" theme="twoTone" twoToneColor={'#357EDD'} />
                    <span className={'ph2 blue b'}>Discover Tags</span>
                </span>
                <Link to={'/communities'} className={'f7 o-50 pointer'}>
                    View All
                </Link>
            </span>

            <div className={'mt3'}>
                {[...tagStore.tags.toJS()].slice(0, 9).map(([tag, tagModel]) => (
                    <span key={tag} className={'f6 dark-gray db pb2'}>
                        <SidebarLinkPopup
                            subscribed={tag}
                            tag={tagModel}
                            onSubscribe={onSubscribe}
                        />
                    </span>
                ))}
            </div>
        </div>
    )
})

SidebarDiscoverTags.defaultProps = {}

export default SidebarDiscoverTags
