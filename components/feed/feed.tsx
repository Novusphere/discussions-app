import * as React from 'react'
import { PostPreview } from '@components'
import { IPost } from '@stores/posts'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { TagModel } from '@models/tagModel'
import FeedModel from '@models/feedModel'
import InfiniteScroll from 'react-infinite-scroll-component'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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

    private renderEndMessage = () => {
        return (
            <div className={'bg-white tc pa3'}>
                <span className={'f6'}>You have reached the end!</span>
            </div>
        )
    }

    private renderLoadingMessage = () => {
        return (
            <div className={'bg-white tc pa3'}>
                <FontAwesomeIcon width={13} icon={faSpinner} spin />
            </div>
        )
    }

    public render() {
        const { threads } = this.props

        if (!threads) {
            return <span>No posts found</span>
        }

        const { postsPosition } = this.props.postsStore

        return (
            <InfiniteScroll
                dataLength={postsPosition.items}
                next={this.getPostsByCurrentTag}
                hasMore={postsPosition.cursorId !== 0}
                loader={this.renderLoadingMessage()}
                endMessage={this.renderEndMessage()}
            >
                {threads.map(post => {
                    return (
                        <PostPreview
                            post={post as any}
                            key={post.uuid}
                            onClick={this.props.onClick}
                            tag={this.props.tagModel}
                            voteHandler={post.vote}
                        />
                    )
                })}
            </InfiniteScroll>
        )
    }
}


export default Feed as unknown as React.FC<IFeedOuterProps>
