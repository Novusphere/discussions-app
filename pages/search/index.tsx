import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { InfiniteScrollFeed } from '@components'

interface ISearchPageProps {
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    searchStore: IStores['searchStore']

    searchValue: string
}

interface ISearchPageState {}

@inject('tagStore', 'postsStore', 'searchStore')
@observer
class Index extends React.Component<ISearchPageProps, ISearchPageState> {
    static async getInitialProps({ query, store }) {
        const searchValue = query.q
        const postsStore: IStores['postsStore'] = store.postsStore
        const uiStore: IStores['uiStore'] = store.uiStore
        const tagStore: IStores['tagStore'] = store.tagStore
        const searchStore: IStores['searchStore'] = store.searchStore

        tagStore.destroyActiveTag()
        uiStore.toggleBannerStatus(true)
        uiStore.toggleSidebarStatus(true)
        postsStore.resetPositionAndPosts()

        await searchStore.resetPositionAndResults()
        await searchStore.getSearchResults(searchValue)

        return {
            searchValue,
        }
    }

    renderPosts = () => {
        const { searchValue } = this.props
        const {
            searchResults,
            getSearchResults,
            searchPosition: { cursorId, items },
        } = this.props.searchStore

        return (
            <InfiniteScrollFeed
                withAnchorUid
                dataLength={items}
                hasMore={cursorId !== 0}
                next={() => getSearchResults(searchValue)}
                posts={searchResults}
            />
        )
    }

    public render() {
        const { searchValue } = this.props
        return (
            <>
                <div className={'card pa4 mb3'}>
                    <span className={'black f5'}>
                        Showing results for: <span className={'b'}>{searchValue}</span>
                    </span>
                </div>

                {this.renderPosts()}
            </>
        )
    }
}

export default Index
