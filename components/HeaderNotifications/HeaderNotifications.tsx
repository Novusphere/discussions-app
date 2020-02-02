import React, { FunctionComponent } from 'react'
import { Icon, Badge } from 'antd'

import styles from './HeaderNotifications.module.scss'

interface IHeaderNotificationsProps {}

const HeaderNotifications: FunctionComponent<IHeaderNotificationsProps> = () => {
    return (
        <div className={styles.notification}>
            <Badge count={10} overflowCount={5}>
                <Icon
                    type={'bell'}
                    twoToneColor={'#08b2ad'}
                    theme={'filled'}
                    style={{ fontSize: 24 }}
                />
            </Badge>
        </div>
    )
}

HeaderNotifications.defaultProps = {}

export default HeaderNotifications
