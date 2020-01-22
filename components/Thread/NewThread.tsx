import * as React from 'react'
import { Thread } from '@novuspherejs'
import NewOpeningPost from '../OpeningPost/NewOpeningPost'
import { Replies } from '@components'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { NextRouter, withRouter } from 'next/router'

interface INewThreadProps {
    router?: NextRouter
    threadSerialized: Thread
    postsStore?: IStores['postsStore']
    authStore?: IStores['authStore']
    settingsStore?: IStores['settingsStore']
    userStore?: IStores['userStore']
}

@(withRouter as any)
@inject('authStore', 'postsStore', 'settingsStore', 'userStore')
@observer
export class NewThread extends React.Component<INewThreadProps, any> {
    render() {
        const {
            props: {
                router,
                threadSerialized,
                userStore,
                authStore: { supportedTokensImages },
                postsStore: { currentHighlightedPostUuid },
                settingsStore: { blockedContentSetting },
            },
        } = this

        return (
            <>
                <NewOpeningPost router={router} openingPost={threadSerialized.openingPost} />
                <Replies
                    authStore={this.props.authStore}
                    userStore={this.props.userStore}
                    router={router}
                    supportedTokensImages={supportedTokensImages}
                    replies={threadSerialized.openingPost.replies}
                    currentHighlightedPostUuid={currentHighlightedPostUuid}
                />
            </>
        )
    }
}
