import React, { FunctionComponent } from 'react'
import copy from 'clipboard-copy'
import styles from './SharePostPopover.module.scss'
import { Button, message } from 'antd'
import { tweetCurrentPage } from '@utils'

interface ISharePostPopoverProps {
    url: string
}

const SharePostPopover: FunctionComponent<ISharePostPopoverProps> = ({ url }) => {
    return (
        <>
            <Button
                shape="circle"
                icon="link"
                title={'Copy a link to this url'}
                onClick={e => {
                    message.success('Copied to your clipboard')
                    e.preventDefault()
                    copy(`${window.location.origin}${url}`)
                }}
            />
            <Button
                className={'ml2'}
                shape="circle"
                icon="twitter"
                title={'Share on twitter'}
                onClick={e => {
                    e.preventDefault()
                    tweetCurrentPage(`${window.location.origin}${url}`)
                }}
            />
        </>
    )
}

SharePostPopover.defaultProps = {}

export default SharePostPopover
