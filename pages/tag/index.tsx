import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores/index'
import { IPost } from '@stores/posts'
import { PostPreview } from '@components'
import { Router } from '@router'
import { TagModel } from '@models/tagModel'
import { Post } from '../../novusphere-js/discussions';

interface ITagProps {
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    tagName: undefined | string
    posts: IPost[]
    tagModel: TagModel
}

@inject('tagStore', 'postsStore')
@observer
class Tag extends React.Component<ITagProps> {
    constructor(props) {
        super(props)
        props.tagStore.setActiveTag(props.tagName)
    }

    static async getInitialProps({ ctx: { store, query }}) {
        const tag = query.name
        const postsStore: IStores['postsStore'] = store.postsStore
        const tagStore: IStores['tagStore'] = store.tagStore
        const tagModel = tagStore.setActiveTag(tag)
        const posts = await postsStore.getPostsByTag([tag])
        const onlyOpeningPosts = posts.filter(post => !post.parentUuid)
        return {
            tagName: tag,
            posts: onlyOpeningPosts,
            tagModel: tagModel,
        }
    }

    public clickPost = (post: IPost) => {
        const id = Post.encodeId(post.transaction, new Date(post.createdAt));
        Router.pushRoute(
            `/e/${post.sub}/${id}/${decodeURIComponent(post.title.replace(/ /g, '_'))}`
        )
    }

    public render() {
        if (!this.props.tagModel) {
            return <span>Tag: {this.props.tagName} not found</span>
        }

        if (!this.props.posts.length) {
            return <span>No posts found for {this.props.tagName}</span>
        }

        return this.props.posts.map(post => (
            <PostPreview
                post={post}
                key={post.uuid}
                onClick={this.clickPost}
                tag={this.props.tagStore.tags.get(post.sub)}
                voteHandler={this.props.postsStore.vote}
            />
        ))
    }
}

export default Tag
