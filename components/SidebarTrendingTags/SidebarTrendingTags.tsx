import React, { FunctionComponent, useEffect } from 'react'

import styles from './SidebarTrendingTags.module.scss'
import { Icon } from 'antd'
import { RootStore, useStores } from '@stores'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router-dom'

interface ISidebarTrendingTagsProps {}

const SidebarTrendingTags: FunctionComponent<ISidebarTrendingTagsProps> = () => {
    const { tagStore }: RootStore = useStores()

    useEffect(() => {
        tagStore.fetchTrendingTags()
    }, [])

    if (tagStore.fetchTrendingTags['pending']) {
        return <Icon type="loading" />
    }

    return (
        <div className={'pa3 bg-white list card mb3'}>
            <span className={'f5'}>
                <Icon type="fire" theme="twoTone" twoToneColor={'#FF6300'} />
                <span className={'ph2 orange'}>Trending Tags</span>
            </span>

            <div className={'mt3'}>
                {tagStore.trendingTags.map(({ tag }, index) => {
                    const { logo }: any = tagStore.tagModelFromObservables(tag)
                    return (
                        <span key={tag} className={'f6 dark-gray db pb2'}>
                            <span className={styles.indexContainer}>
                                <span className={'gray f6 mr2'}>{index + 1}</span>
                                <Icon type="caret-up" theme="filled" style={{ color: '#19A974' }} />
                            </span>
                            <img className={'dib mr2'} src={logo} alt={`${tag} icon`} width={25} />
                            <Link to={`/tag/${tag}`}>#{tag}</Link>
                        </span>
                    )
                })}
            </div>
        </div>
    )
}

SidebarTrendingTags.defaultProps = {}

export default observer(SidebarTrendingTags)
