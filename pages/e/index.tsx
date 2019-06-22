import * as React from 'react'
import {inject, observer} from 'mobx-react'
import {IStores} from "@stores/index";
import {MainPost} from "@components";

interface IEPage {
    postsStore: IStores['postsStore']
    query: {
        tag: string
        id: string
        title: string
    }
}

@inject('postsStore')
@observer
class E extends React.Component<IEPage, any> {
    static async getInitialProps({ctx: {query}}) {
        return {
            query,
        }
    }

    componentWillMount(): void {
        this.props.postsStore.setActivePostId(
            this.props.query.id
        )
    }

    componentDidMount(): void {
        this.props.postsStore.fetchPost()
    }

    public render(): React.ReactNode {
        const {fetchPost} = this.props.postsStore;

        return (fetchPost as any).match({
            pending: () => <span>Loading...</span>,
            rejected: () => <span>Something went wrong</span>,
            resolved: () => null
            // resolved: ({ openingPost }) => {
            //     return (
            //         <MainPost openingPost={openingPost}/>
            //     );
            // }
        })
    }
}

export default E
