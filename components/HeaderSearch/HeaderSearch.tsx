import React, { FunctionComponent } from 'react'
import { Input } from 'antd'
import styles from './HeaderSearch.module.scss'
import { useRouter } from 'next/router'

const { Search } = Input

interface IHeaderSearchProps {}

const HeaderSearch: FunctionComponent<IHeaderSearchProps> = () => {
    const router = useRouter()

    return (
        <Search
            className={styles.search}
            size={'default'}
            placeholder={'Search on Discussions.app'}
            onSearch={value => router.push(`/search/${value}`)}
        />
    )
}

HeaderSearch.defaultProps = {}

export default HeaderSearch
