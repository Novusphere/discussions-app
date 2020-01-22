import * as React from 'react'
import { Thread } from '@novuspherejs'
import { NewOpeningPost } from '../OpeningPost/NewOpeningPost'
import { observable } from 'mobx'
import { ThreadModel } from '@models/threadModel'

interface INewThreadProps {
    supportedTokensImages: any
    thread: Thread
}

export class NewThread extends React.Component<INewThreadProps, any> {
    @observable thread: ThreadModel = null

    componentDidMount(): void {
        this.thread = new ThreadModel(this.props.thread)
    }

    render() {
        const {
            thread,
            props: {
                supportedTokensImages,
                thread: { openingPost },
            },
        } = this

        return (
            <>
                <NewOpeningPost openingPost={openingPost} thread={thread} supportedTokensImages={supportedTokensImages} />
            </>
        )
    }
}
