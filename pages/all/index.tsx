import * as React from 'react'
import { IStores } from '@stores'
import { Post } from '@novuspherejs'
import { inject, observer } from 'mobx-react'
import { IPost } from '@stores/posts'
import { pushToThread, sleep } from '@utils'
import { InfiniteScrollFeed } from '@components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

interface IAllProps {
    tagStore: IStores['tagStore']
    posts: Post[]
    cursorId: number
}

interface IAllState {}

@inject('tagStore')
@observer
class All extends React.Component<IAllProps, IAllState> {
    static async getInitialProps({ store }) {
        const uiStore: IStores['uiStore'] = store.uiStore
        const postsStore: IStores['postsStore'] = store.postsStore
        const tagStore: IStores['tagStore'] = store.tagStore

        postsStore.resetPositionAndPosts()

        uiStore.toggleSidebarStatus(true)
        uiStore.toggleBannerStatus(true)
        tagStore.destroyActiveTag()

        return {}
    }

    async componentDidMount(): Promise<void> {
        await sleep(500)
        await this.props.tagStore.getPostsBySubscribed()
    }

    public clickPost = (post: IPost) => {
        pushToThread(post)
    }

    public render() {
        const { getPostsBySubscribed, postsPosition, allPosts } = this.props.tagStore
        const { cursorId, count } = postsPosition

        return (
            <InfiniteScrollFeed
                dataLength={count}
                hasMore={cursorId !== 0}
                next={getPostsBySubscribed}
                posts={allPosts}
                postOnClick={this.clickPost}
            />
        )
    }
}

export default All
