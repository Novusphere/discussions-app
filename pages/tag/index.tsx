import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { IPost } from '@stores/posts'
import { Feed } from '@components'
import { Router } from '@router'
import { TagModel } from '@models/tagModel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import FeedModel from '@models/feedModel'

interface ITagProps {
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    tagName: undefined | string
    tagModel: TagModel
}

// TODO: Merge logic between e/page and tag/page. Right now it's separated.

@inject('tagStore', 'postsStore')
@observer
class Tag extends React.Component<ITagProps> {
    static async getInitialProps({ ctx: { store, query } }) {
        const tag = query.name
        const postsStore: IStores['postsStore'] = store.postsStore
        const tagStore: IStores['tagStore'] = store.tagStore

        const tagModel = tagStore.setActiveTag(tag)

        if (
            !postsStore.feedThreads ||
            !postsStore.feedThreads.length ||
            postsStore.feedThreads.some(thread => thread['tags'].indexOf(tag) === -1)
        ) {
            await postsStore.getPostsByTag([tag])
        }

        return {
            tagName: tag,
            tagModel: tagModel,
        }
    }

    async componentWillMount(): Promise<void> {
        await this.props.postsStore.getPostsByTag([this.props.tagName])
    }

    public clickPost = (post: IPost) => {
        const id = this.props.postsStore.encodeId(post) // Post.encodeId(post.transaction, new Date(post.createdAt));
        Router.pushRoute(
            `/e/${post.sub}/${id}/${decodeURIComponent(post.title.replace(/ /g, '_'))}`
        )
        this.props.postsStore.setActiveThreadId(id)
    }

    public render() {
        const {
            clickPost,
            props: { tagModel },
        } = this

        return this.props.postsStore.getPostsByTag['match']({
            pending: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
            rejected: () => <span>No posts found for specified tag: {this.props.tagName}</span>,
            resolved: (feed: FeedModel[]) => (
                <Feed threads={feed} onClick={clickPost} tagModel={tagModel} />
            ),
        })
    }
}

export default Tag
