import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { IPost } from '@stores/posts'
import { PostPreview } from '@components'
import { Router } from '@router'
import { TagModel } from '@models/tagModel'
import { Post } from '@novuspherejs/discussions/post'
import { autorun, observable } from 'mobx'
import { ThreadModel } from '@models/threadModel'

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
    @observable private feed: ThreadModel[]

    constructor(props) {
        super(props)
        props.tagStore.setActiveTag(props.tagName)
    }

    static async getInitialProps({ ctx: { store, query } }) {
        const tag = query.name
        const postsStore: IStores['postsStore'] = store.postsStore
        const tagStore: IStores['tagStore'] = store.tagStore
        const tagModel = tagStore.setActiveTag(tag)
        await postsStore.getPostsByTag([tag])
        // const onlyOpeningPosts = posts.filter(post => post.title.length)
        return {
            tagName: tag,
            tagModel: tagModel,
        }
    }

    public clickPost = (post: IPost) => {
        const id = this.props.postsStore.encodeId(post) // Post.encodeId(post.transaction, new Date(post.createdAt));
        Router.pushRoute(
            `/e/${post.sub}/${id}/${decodeURIComponent(post.title.replace(/ /g, '_'))}`
        )
    }

    componentWillMount(): void {
        autorun(() => {
            if (this.props.postsStore.feedThreads) {
                if (this.feed instanceof ThreadModel) {
                    this.feed = this.props.postsStore.feedThreads
                } else {
                    this.feed = this.props.postsStore.feedThreads.map(
                        thread => new ThreadModel(thread.openingPost)
                    )
                }
            }
        })
    }

    public render() {
        if (!this.props.tagModel) {
            return <span>Tag: {this.props.tagName} not found</span>
        }

        if (!this.props.postsStore.posts.length) {
            return <span>No posts found for {this.props.tagName}</span>
        }

        return this.feed.map(post => {
            return (
                <PostPreview
                    post={post.openingPost as any}
                    key={post.uuid}
                    onClick={this.clickPost}
                    tag={this.props.tagStore.tags.get((post.openingPost as Post).sub)}
                    voteHandler={post.vote}
                />
            )
        })
    }
}

export default Tag
