import React, { FunctionComponent } from 'react'
import { Input } from 'antd'
import styles from './HeaderSearch.module.scss'
import { useHistory } from 'react-router-dom'

const { Search } = Input

interface IHeaderSearchProps {}

const HeaderSearch: FunctionComponent<IHeaderSearchProps> = () => {
    const history = useHistory()

    return (
        <Search
            className={styles.search}
            size={'default'}
            placeholder={'Search on Discussions.app'}
            onSearch={value => history.push(`/search/${value}`)}
        />
    )
}

HeaderSearch.defaultProps = {}

export default HeaderSearch
