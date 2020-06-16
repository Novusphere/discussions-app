import React, { FunctionComponent, memo } from 'react'

import styles from './SidebarLinkPopup.module.scss'
import { Popover, Button, Icon, Divider, Typography } from 'antd'
import { Link } from 'react-router-dom'
import Markdown from 'markdown-to-jsx'
import cx from 'classnames'

const { Text } = Typography

interface ISidebarLinkPopupProps {
    subscribed: string
    tag: any
    onSubscribe?: (subscribed: string) => void
    onUnsubscribe?: (subscribed: string) => void
    onMyTagClick: () => void
    isMobile: boolean
}

const SidebarLinkPopup: FunctionComponent<ISidebarLinkPopupProps> = ({
    subscribed,
    tag,
    onSubscribe,
    onUnsubscribe,
    isMobile = false,
    onMyTagClick,
}) => {
    return (
        <Popover
            content={
                <div className={'pa1 w5'}>
                    <span className={'f5 flex flex-row items-center justify-between'}>
                        <span className={'flex flex-row items-center'}>
                            <img
                                className={'dib'}
                                src={tag.logo}
                                alt={`${subscribed} icon`}
                                width={45}
                            />
                            <span className={'mh3 dib'}>
                                <span className={'b db'}>
                                    <Link to={`/tag/${subscribed}`}>
                                        <span className={'f5 black db'}>#{subscribed}</span>
                                    </Link>
                                </span>
                                {typeof tag.memberCount !== 'undefined' && (
                                    <span className={'f6 db gray'}>{tag.memberCount} members</span>
                                )}
                            </span>
                        </span>
                        {typeof onUnsubscribe !== 'undefined' && (
                            <Button onClick={() => onUnsubscribe(subscribed)} shape="circle">
                                <Icon type="delete" />
                            </Button>
                        )}
                        {typeof onSubscribe !== 'undefined' && (
                            <Button onClick={() => onSubscribe(subscribed)} shape="circle">
                                <Icon type="plus" />
                            </Button>
                        )}
                    </span>
                    {tag.tagDescription && (
                        <>
                            <Divider />
                            <Markdown className={cx(['f6', styles.tagDescription])}>
                                {tag.tagDescription}
                            </Markdown>
                        </>
                    )}
                </div>
            }
            placement={'right'}
            overlayClassName={styles.tagOverlay}
        >
            <Link
                to={`/tag/${subscribed}`}
                onClick={() => {
                    if (isMobile) {
                        onMyTagClick()
                    }
                }}
            >
                <span className={'flex flex-row items-center'}>
                    <img src={tag.logo} alt={`${subscribed} icon`} width={25} />
                    <span className={'mh2 flex flex-row items-center'}>
                        <Text ellipsis style={{ maxWidth: '100px' }}>
                            #{subscribed}
                        </Text>
                    </span>
                </span>
            </Link>
        </Popover>
    )
}

SidebarLinkPopup.defaultProps = {}

export default memo(SidebarLinkPopup)
