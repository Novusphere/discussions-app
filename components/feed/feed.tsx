import * as React from 'react'
import { PostPreview } from '@components'
import { IPost } from '@stores/posts'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { TagModel } from '@models/tagModel'
import FeedModel from '@models/feedModel'

interface IFeedProps {
    tagStore?: IStores['tagStore']
    threads: FeedModel[]
    onClick: (post: IPost) => void
    tagModel: TagModel
}

@inject('tagStore')
@observer
class Feed extends React.Component<IFeedProps> {
    public render() {
        return this.props.threads.map(post => {
            return (
                <PostPreview
                    post={post as any}
                    key={post.uuid}
                    onClick={this.props.onClick}
                    tag={this.props.tagModel}
                    voteHandler={post.vote}
                />
            )
        })
    }
}

export default Feed
