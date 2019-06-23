import * as React from 'react'
import { IPost } from '@stores/posts'
import { observer } from 'mobx-react'
import { Votes } from '@components'
import { Link } from '@router'

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
                        <a>{openingPost.poster}</a>
                    </Link>{' '}
                    in{' '}
                    <Link route={`/e/${openingPost.sub}`}>
                        <a>{openingPost.sub}</a>
                    </Link>
                </div>
                <span className={'black f6 lh-copy'}>{openingPost.content}</span>
            </div>
        </div>
    )
}

export default observer(MainPost)
