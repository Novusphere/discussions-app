import * as React from 'react'
import { IPost } from '@stores/posts'
import { observer } from 'mobx-react'
import { Votes } from '@components'
import { Link } from '@router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faReply,
    faUserCircle,
    faClock,
    faLink,
    faShare,
    faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'

interface IMainPost {
    openingPost: IPost
}

const MainPost: React.FC<IMainPost> = ({ openingPost }) => {
    return (
        <div className={'opening-post'}>
            <div className={'post-content'}>
                <div className={'flex justify-between items-center pb1'}>
                    <span className={'black f4 b'}>{openingPost.title}</span>
                    <Votes votes={openingPost.votes} />
                </div>

                <div className={'meta pb2'}>
                    <Link route={`/u/${openingPost.poster}`}>
                        <>
                            <FontAwesomeIcon icon={faUserCircle} className={'pr1'} />
                            <a>{openingPost.poster}</a>
                        </>
                    </Link>{' '}
                    in{' '}
                    <Link route={`/e/${openingPost.sub}`}>
                        <a>{openingPost.sub}</a>
                    </Link>
                </div>

                <span className={'black f6 lh-copy'}>{openingPost.content}</span>

                <div className={'footer flex items-center pt3'}>
                    <button className={'reply mr3'}>
                        <FontAwesomeIcon icon={faReply} className={'pr1'} />
                        reply
                    </button>

                    <span className={'f6 mr3'}>
                        <FontAwesomeIcon icon={faClock} className={'pr1'} />
                        {moment(openingPost.createdAt).fromNow()}
                    </span>

                    <FontAwesomeIcon icon={faLink} className={'pr2 black f6'} />
                    <FontAwesomeIcon icon={faShare} className={'pr2 black f6'} />

                    <span className={'f6 black f6'}>
                        <FontAwesomeIcon icon={faExclamationTriangle} className={'pr1'} />
                        mark as spam
                    </span>
                </div>
            </div>
        </div>
    )
}

export default observer(MainPost)
