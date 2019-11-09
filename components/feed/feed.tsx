import * as React from 'react'
import { InfiniteScrollFeed } from '@components'
import { IPost } from '@stores/posts'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { TagModel } from '@models/tagModel'
import FeedModel from '@models/feedModel'

interface IFeedOuterProps {
    threads: FeedModel[]
    onClick: (post: IPost) => void
    tagModel: TagModel
}

interface IFeedInnerProps {
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
}

@inject('tagStore', 'postsStore')
@observer
class Feed extends React.Component<IFeedOuterProps & IFeedInnerProps> {
    private getPostsByCurrentTag = async () => {
        const { tagModel } = this.props
        const { getPostsByTag } = this.props.postsStore
        await getPostsByTag([tagModel.name])
    }

    public render() {
        const { threads, onClick, tagModel } = this.props

        if (!threads) {
            return <span>No posts found</span>
        }

        const { postsPosition } = this.props.postsStore

        return (
            <InfiniteScrollFeed
                dataLength={postsPosition.items}
                hasMore={postsPosition.cursorId !== 0}
                next={this.getPostsByCurrentTag}
                posts={threads}
                postOnClick={onClick}
                tagModel={tagModel}
            />
        )
    }
}

export default (Feed as unknown) as React.FC<IFeedOuterProps>
