import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { Button } from 'antd'

import styles from './HeaderNewPost.module.scss'
import { useHistory, useLocation } from 'react-router-dom'

interface IHeaderNewPostProps {}

const HeaderNewPost: FunctionComponent<IHeaderNewPostProps> = () => {
    const history = useHistory()
    const [tag, setTag] = useState<string>(null)
    const location = useLocation()
    const newPostPath = useMemo(() => {
        if (tag) {
            return `/new/${tag}`
        }

        return '/new'
    }, [tag])

    useEffect(() => {
        if (location.pathname.indexOf('/tag/') !== -1) {
            setTag(location.pathname.split('/')[2])
        }
    }, [location])

    return (
        <Button
            type={'primary'}
            icon={'plus'}
            size={'default'}
            className={styles.button}
            onClick={() => history.push(newPostPath)}
        >
            New Post
        </Button>
    )
}

HeaderNewPost.defaultProps = {}

export default HeaderNewPost
