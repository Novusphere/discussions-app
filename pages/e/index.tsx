import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores/index'
import { MainPost } from '@components'

interface IEPage {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
    isTagView: boolean
    query: {
        tag: string
        id: string
        title: string
    }
}

@inject('postsStore', 'tagStore')
@observer
class E extends React.Component<IEPage> {
    static async getInitialProps({ ctx: { query } }) {
        const isTagView = typeof query.id === 'undefined' && typeof query.title === 'undefined'
        return {
            query,
            isTagView,
        }
    }

    componentWillMount(): void {
        if (this.props.isTagView) {
            this.props.postsStore.getPostsByTag([this.props.query.tag])
        }

        if (!this.props.isTagView) {
            this.props.postsStore.setActivePostId(this.props.query.id)
            ;(this.props.postsStore.fetchPost as any).reset()
            this.props.postsStore
                .fetchPost()
                .then((thread: any) => {
                    console.log(thread)
                    this.props.tagStore.setActiveTag(thread.openingPost.sub)
                    console.log(this.props.tagStore)
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }

    public render(): React.ReactNode {
        if (this.props.isTagView) {
            return <span>Tag View!</span>
        }

        const { fetchPost } = this.props.postsStore
        return (fetchPost as any).match({
            pending: () => <span>Loading...</span>,
            rejected: err => <span>{err.message}</span>,
            resolved: ({ openingPost }) => {
                return <MainPost openingPost={openingPost} />
            },
        })
    }
}

export default E
