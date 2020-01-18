import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { OpeningPost } from '@components'
import PostModel from '@models/postModel'

interface IPostPreviewProps {
    postsStore: IStores['postsStore']
    authStore: IStores['authStore']
    tagStore: IStores['tagStore']
}

@inject('postsStore', 'authStore', 'tagStore')
@observer
class NewPostPreview extends React.Component<IPostPreviewProps> {
    public render(): React.ReactNode {
        const { preview } = this.props.postsStore
        const { activeDisplayName, activePublicKey } = this.props.authStore

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
            poster: activeDisplayName,
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
                        addAsModerator={null}
                        hasReplyContent={false}
                        showPostWarningCloseModal={() => null}
                        activeTag={null}
                        isPreview
                        activeThread={null}
                        openingPost={new PostModel(post as any)}
                        asPath={null}
                        id={null}
                        isBlockedPost={false}
                    />
                </div>
            </>
        )
    }
}

export default NewPostPreview as any
