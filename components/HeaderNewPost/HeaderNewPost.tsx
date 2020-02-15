import React, { FunctionComponent } from 'react'
import { Button } from 'antd'

import styles from './HeaderNewPost.module.scss'
import { useRouter } from 'next/router'

interface IHeaderNewPostProps {}

const HeaderNewPost: FunctionComponent<IHeaderNewPostProps> = () => {
    const router = useRouter()

    return (
        <Button
            type={'primary'}
            icon={'plus'}
            size={'default'}
            className={styles.button}
            onClick={() => router.push('/new', '/new')}
        >
            New Post
        </Button>
    )
}

HeaderNewPost.defaultProps = {}

export default HeaderNewPost
