import React, { FunctionComponent } from 'react'
import cx from 'classnames'
import { Skeleton } from 'antd'

import styles from './PostPreviewLoading.module.scss'

interface IPostPreviewLoadingProps {}

const PostPreviewLoading: FunctionComponent<IPostPreviewLoadingProps> = () => {
    return (
        <div className={'flex flex-row items-center bg-white mh1 mb3'}>
            <div
                className={cx([
                    'h-100 db bg-light-gray flex tc justify-center ph2 pv4 relative z-2 flex-auto',
                ])}
                style={{ height: '200px', width: '40px' }}
            />
            <Skeleton className={'ml3'} active />
        </div>
    )
}

PostPreviewLoading.defaultProps = {}

export default PostPreviewLoading
