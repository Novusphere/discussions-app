import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores/index'
import { MainPost } from '@components'

interface IEPage {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
    query: {
        tag: string
        id: string
        title: string
    }
}

@inject('postsStore', 'tagStore')
@observer
class E extends React.Component<IEPage, any> {
    static async getInitialProps({ ctx: { query } }) {
        return {
            query,
        }
    }

    componentWillMount(): void {
        this.props.postsStore.setActivePostId(this.props.query.id)
        ;(this.props.postsStore.fetchPost as any).reset()
        this.props.postsStore
            .fetchPost()
            .then((thread: any) => {
                console.log(thread.openingPost)
                this.props.tagStore.setActiveTag(thread.openingPost.sub)
                console.log(this.props.tagStore)
            })
            .catch(err => {
                console.log(err)
            })
    }

    public render(): React.ReactNode {
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
