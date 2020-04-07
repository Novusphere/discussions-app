import React, { FunctionComponent } from 'react'

import styles from './SidebarDiscoverTags.module.scss'
import { Icon, Spin, Button } from 'antd'
import { observer } from 'mobx-react'
import { Link, useHistory } from 'react-router-dom'

interface ISidebarTrendingTagsProps {}

const SidebarDiscoverTags: FunctionComponent<ISidebarTrendingTagsProps> = observer(() => {
    const history = useHistory()

    return (
        <Button icon={'bulb'} block type={'primary'} onClick={() => history.push('/communities')}>
            Discover More Tags
        </Button>
    )
})

SidebarDiscoverTags.defaultProps = {}

export default SidebarDiscoverTags
