import * as React from 'react'
import { Thread } from '@novuspherejs'
import NewOpeningPost from '../OpeningPost/NewOpeningPost'
import { Replies } from '@components'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { NextRouter, withRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

interface INewThreadProps {
    id: string
    router?: NextRouter
    threadSerialized: Thread
    postsStore?: IStores['postsStore']
    authStore?: IStores['authStore']
    settingsStore?: IStores['settingsStore']
    userStore?: IStores['userStore']
    uiStore?: IStores['uiStore']
    tagStore?: IStores['tagStore']
}

@(withRouter as any)
@inject('authStore', 'postsStore', 'settingsStore', 'userStore', 'uiStore', 'tagStore')
@observer
export class NewThread extends React.Component<INewThreadProps, any> {
    state = {
        replies: [],
        activeThread: null,
    }

    componentDidUpdate(
        prevProps: Readonly<INewThreadProps>,
        prevState: Readonly<any>,
        snapshot?: any
    ): void {
        if (prevState.activeThread !== this.props.postsStore.activeThreadSerialized) {
            this.setState({
                activeThread: this.props.postsStore.activeThreadSerialized,
            })
        }
    }

    async componentDidMount() {
        this.setState({
            replies: this.props.threadSerialized.openingPost.replies,
        })

        if (this.props.postsStore.firstSplash) {
            await this.props.postsStore.getAndSetThread(this.props.id)
            this.props.postsStore.firstSplash = false

            this.setState({
                replies: this.props.postsStore.activeThreadSerialized.openingPost.replies,
            })
        }
    }

    addReplies = reply => {
        this.setState(prevState => ({
            replies: [...prevState.replies, reply],
            activeThread: {
                ...prevState.activeThread,
                openingPost: {
                    ...prevState.activeThread.openingPost,
                    replies: [...prevState.activeThread.openingPost.replies, reply],
                },
            },
        }))
    }

    render() {
        const {
            state: { activeThread, replies },
            props: {
                router,
                threadSerialized,
                userStore,
                authStore,
                uiStore,
                postsStore,
                settingsStore,
                tagStore,
            },
        } = this

        const activeTag = tagStore.tags.get(threadSerialized.openingPost.sub)

        return (
            <>
                <Link href={`/tag/[name]`} as={`/tag/${threadSerialized.openingPost.sub}`}>
                    <a>
                        <button
                            className={'tl flex items-center mb2'}
                            title={`Show all posts in ${threadSerialized.openingPost.sub}`}
                        >
                            <FontAwesomeIcon width={13} icon={faChevronLeft} className={'pr1'} />
                            {activeTag && (
                                <img
                                    width={20}
                                    height={20}
                                    src={activeTag.icon}
                                    className={'activeTag-image'}
                                />
                            )}
                            {`#${threadSerialized.openingPost.sub}`}
                        </button>
                    </a>
                </Link>
                <NewOpeningPost
                    router={router}
                    openingPost={threadSerialized.openingPost}
                    activeThread={activeThread}
                    addReplies={this.addReplies}
                />
                <Replies
                    authStore={authStore}
                    userStore={userStore}
                    uiStore={uiStore}
                    postsStore={postsStore}
                    settingsStore={settingsStore}
                    router={router}
                    supportedTokensImages={authStore.supportedTokensImages}
                    replies={replies}
                    activeThread={activeThread}
                />
            </>
        )
    }
}
