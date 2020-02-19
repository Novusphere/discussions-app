import React, { FunctionComponent } from 'react'
import { Button } from 'antd'

import styles from './HeaderNewPost.module.scss'
import { useHistory } from 'react-router-dom'

interface IHeaderNewPostProps {}

const HeaderNewPost: FunctionComponent<IHeaderNewPostProps> = () => {
    const history = useHistory()

    return (
        <Button
            type={'primary'}
            icon={'plus'}
            size={'default'}
            className={styles.button}
            onClick={() => history.push('/new')}
        >
            New Post
        </Button>
    )
}

HeaderNewPost.defaultProps = {}

export default HeaderNewPost
