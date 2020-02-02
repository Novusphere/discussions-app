import React, { FunctionComponent } from 'react'
import { Input } from 'antd'
import styles from './HeaderSearch.module.scss'

const { Search } = Input

interface IHeaderSearchProps {}

const HeaderSearch: FunctionComponent<IHeaderSearchProps> = () => {
    return (
        <Search
            className={styles.search}
            size={'large'}
            placeholder={'Search on Discussions.app'}
            onSearch={value => console.log(value)}
        />
    )
}

HeaderSearch.defaultProps = {}

export default HeaderSearch
