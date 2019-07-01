import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import { INotificationPost } from '@novuspherejs/discussions/notification'
import { TagModel } from '@models/tagModel'

interface IPostPreviewProps {
    onClick: (post) => void
    notification: INotificationPost
    tag: TagModel
}

const Notification: React.FC<IPostPreviewProps> = ({ notification, onClick, tag }) => (
    <div className={'post-preview'}>
        <div className={'flex flex-auto'}>
            {/*<div className={'bg-light-gray flex tc justify-center ph2 pv4 relative z-2 flex-auto'}>*/}
            {/*<Votes votes={notification.votes} />*/}
            {/*</div>*/}

            <div
                className={'flex flex-column post-content w-100 content-fade'}
                onClick={() => onClick(notification)}
            >
                <div className={'flex f6 lh-copy black items-center'}>
                    <img src={tag.icon} title={`${tag.name} icon`} className={'w-10'} />
                    <span className={'b ttu'}>{notification.data.json_metadata.sub}</span>
                    <span className={'ph1 b'}>&#183;</span>
                    <span className={'o-80'}>by {notification.data.poster}</span>
                    <span className={'o-50 pl2'}>
                        {moment(notification.createdAt * 1000).fromNow()}
                    </span>
                </div>
                <div className={'flex justify-between items-center pt1 pb3'}>
                    <span className={'black f3 b lh-title'}>
                        {notification.data.json_metadata.title}
                    </span>
                </div>

                <span
                    className={'black lh-copy measure-wide'}
                    dangerouslySetInnerHTML={{ __html: notification.data.content }}
                />

                <div className={'flex z-2 relative mt3 footer b'}>
                    <span className={'o-80 f6 ml2 dim pointer'}>
                        <FontAwesomeIcon icon={faComment} className={'pr2'} />
                        {notification.replies.length} comments
                    </span>
                    <span className={'o-80 f6 ml2 dim pointer'}>share</span>
                    <span className={'o-80 f6 ml2 dim pointer'}>reply</span>
                    <span className={'o-80 f6 ml2 dim pointer'}>mark as spam</span>
                </div>
            </div>
        </div>
    </div>
)

export default Notification
