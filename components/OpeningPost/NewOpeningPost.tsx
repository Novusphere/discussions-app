import * as React from 'react'
import Link from 'next/link'
import { Tips, UserNameWithIcon } from '@components'
import moment from 'moment'
import { Post } from '@novuspherejs'
import { ThreadModel } from '@models/threadModel'

interface INewOpeningPostProps {
    openingPost: Post
    thread: ThreadModel
    supportedTokensImages: any
}

export class NewOpeningPost extends React.Component<INewOpeningPostProps, any> {
    componentDidMount(): void {}

    render() {
        const { openingPost, supportedTokensImages } = this.props

        return (
            <div data-post-uuid={openingPost.uuid}>
                <div className={'opening-post card'}>
                    <div className={'post-content'}>
                        <div className={'flex items-center pb2'}>
                            <Link href={`/tag/[name]`} as={`/tag/${openingPost.sub}`}>
                                <a>
                                    <span className={'b'}>{openingPost.sub}</span>
                                </a>
                            </Link>
                            <span className={'ph1 b'}>&#183;</span>
                            <UserNameWithIcon
                                pub={openingPost.pub}
                                imageData={openingPost.imageData}
                                name={openingPost.displayName}
                                imageSize={20}
                            />
                            <span className={'ph1 b'}>&#183;</span>
                            <span
                                title={moment(
                                    openingPost.edit ? openingPost.editedAt : openingPost.createdAt
                                ).format('YYYY-MM-DD HH:mm:ss')}
                            >
                                {openingPost.edit && 'edited '}{' '}
                                {moment(
                                    openingPost.edit ? openingPost.editedAt : openingPost.createdAt
                                ).fromNow()}
                            </span>
                            <Tips tokenImages={supportedTokensImages} tips={openingPost.tips} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
