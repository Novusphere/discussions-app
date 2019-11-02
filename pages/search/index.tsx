import * as React from 'react'
import { discussions } from '@novuspherejs'
import { IPost } from '@stores/posts'
import PostPreview from '../../components/post-preview/post-preview'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { pushToThread } from '@utils'

interface ISearchPageProps {
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    searchValue: string
    searchResult: IPost[]
}

interface ISearchPageState {}

@inject('tagStore', 'postsStore')
@observer
class Index extends React.Component<ISearchPageProps, ISearchPageState> {
    static async getInitialProps({ query, store }) {
        const searchValue = query.q
        const postsStore: IStores['postsStore'] = store.postsStore
        postsStore.resetPositionAndPosts()
        const searchResult = await discussions.getPostsForSearch(searchValue)
        return {
            searchValue,
            searchResult,
        }
    }

    componentWillMount(): void {
        this.props.tagStore.destroyActiveTag()
    }

    public clickPost = (post: IPost) => {
        pushToThread(post)
    }

    renderPosts = () => {
        const { searchResult } = this.props

        if (!searchResult.length || !searchResult) {
            return <span className={'f6'}>No results found</span>
        }

        return searchResult
            .filter(result => result.tags[0].length)
            .map(result => (
                <PostPreview
                    key={result.id}
                    post={result as any}
                    onClick={this.clickPost}
                    tag={this.props.tagStore.tags.get(result.sub)}
                    disableVoteHandler
                />
            ))
    }

    public render() {
        const { searchValue, searchResult } = this.props
        return (
            <>
                <div className={'card pa4 mb3'}>
                    <span className={'black f5'}>
                        Showing results for: <span className={'b'}>{searchValue}</span>
                    </span>
                    <span className={'f5 pl2'}>({searchResult.length} results)</span>
                </div>

                {this.renderPosts()}
            </>
        )
    }
}

export default Index
