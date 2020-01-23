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
    uiStore?: IStores['uiStore']
}

@(withRouter as any)
@inject('authStore', 'postsStore', 'settingsStore', 'userStore', 'uiStore')
@observer
export class NewThread extends React.Component<INewThreadProps, any> {
    render() {
        const {
            props: {
                router,
                threadSerialized,
                userStore,
                authStore,
                uiStore,
                postsStore: { currentHighlightedPostUuid, highlightPostUuid },
                settingsStore: { blockedContentSetting },
            },
        } = this

        return (
            <>
                <NewOpeningPost router={router} openingPost={threadSerialized.openingPost} />
                <Replies
                    authStore={authStore}
                    userStore={userStore}
                    uiStore={uiStore}
                    router={router}
                    supportedTokensImages={authStore.supportedTokensImages}
                    replies={threadSerialized.openingPost.replies}
                    currentHighlightedPostUuid={currentHighlightedPostUuid}
                    highlightPostUuid={highlightPostUuid}
                />
            </>
        )
    }
}
