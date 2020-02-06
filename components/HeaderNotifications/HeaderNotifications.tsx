import React, { FunctionComponent } from 'react'
import { Icon, Badge, Button } from 'antd'

import styles from './HeaderNotifications.module.scss'
import { useObserver } from 'mobx-react-lite'

interface IHeaderNotificationsProps {}

const HeaderNotifications: FunctionComponent<IHeaderNotificationsProps> = () => {
    return useObserver(() => (
        <Badge count={0} overflowCount={5}>
            <Button type={'link'}>
                <Icon
                    type={'bell'}
                    twoToneColor={'#08b2ad'}
                    theme={'filled'}
                    style={{ fontSize: 24, color: '#a8a8a8' }}
                />
            </Button>
        </Badge>
    ))
}

HeaderNotifications.defaultProps = {}

export default HeaderNotifications
