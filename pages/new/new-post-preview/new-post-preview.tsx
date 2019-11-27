import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { OpeningPost } from '@components'
import PostModel from '@models/postModel'

interface IPostPreviewProps {
    postsStore: IStores['postsStore']
    newAuthStore: IStores['newAuthStore']
    tagStore: IStores['tagStore']
}

@inject('postsStore', 'newAuthStore', 'tagStore')
@observer
class NewPostPreview extends React.Component<IPostPreviewProps> {
    public render(): React.ReactNode {
        const { preview } = this.props.postsStore
        const { getActiveDisplayName, activePublicKey } = this.props.newAuthStore

        if (!preview) {
            return null
        }

        const post = {
            id: 0,
            transaction: '',
            blockApprox: 0,
            chain: '',
            parentUuid: '',
            threadUuid: '',
            uuid: '',
            title: preview.title,
            poster: getActiveDisplayName,
            content: preview.content,
            createdAt: Date.now() as any,
            sub: preview.sub.value,
            tags: [],
            pub: activePublicKey,
            mentions: [],
            edit: false,
            anonymousId: '',
            anonymousSignature: '',
            verifyAnonymousSignature: '',
            attachment: null,
            replies: [],
            totalReplies: 0,
            score: 0,
            upvotes: 0,
            downvotes: 0,
            alreadyVoted: false,
        }

        return (
            <>
                <span className={'lh-copy f6'}>
                    This is what your post will look like before you post.
                </span>
                <div className={'mt3'}>
                    <OpeningPost
                        hasReplyContent={false}
                        showPostWarningCloseModal={() => null}
                        activeTag={null}
                        isPreview
                        activeThread={null}
                        openingPost={new PostModel(post as any)}
                        asPath={null}
                        id={null}
                    />
                </div>
            </>
        )
    }
}

export default NewPostPreview as any
