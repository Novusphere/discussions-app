import React, { FunctionComponent } from 'react'
import { Button } from 'antd'

import styles from './HeaderNewPost.module.scss'

interface IHeaderNewPostProps {}

const HeaderNewPost: FunctionComponent<IHeaderNewPostProps> = () => {
    return <Button type={'primary'} icon={'plus'} size={'default'} className={styles.button}>New Post</Button>
}

HeaderNewPost.defaultProps = {}

export default HeaderNewPost
