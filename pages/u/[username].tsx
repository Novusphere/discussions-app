import * as React from 'react'
import { discussions, dummy, Post } from '@novuspherejs'
import { IStores } from '@stores'
import { inject, observer } from 'mobx-react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { computed } from 'mobx'
import { getIdenticon } from '@utils'
import { CopyToClipboard, InfiniteScrollFeed, TagDropdown } from '@components'

interface IUPageProps {
    userStore: IStores['userStore']
    postsStore: IStores['postsStore']
    authStore: IStores['authStore']
    tagStore: IStores['tagStore']
    uiStore: IStores['uiStore']

    followers: number

    username: string
    uidw: string
    pub: string
    icon: string
    posts: Post[]
}

interface IUIPageState {
    followers: number
    isFirstRender: boolean
}

@inject('userStore', 'authStore', 'postsStore', 'tagStore', 'uiStore')
@observer
class U extends React.Component<IUPageProps, IUIPageState> {
    constructor(props) {
        super(props)

        this.state = {
            followers: props.followers,
            isFirstRender: false,
        }
    }

    static async getInitialProps({ query, store }) {
        const postsStore: IStores['postsStore'] = store.postsStore
        const [username, pub] = query.username.split('-')
        const data = await discussions.getUser(pub)
        const followers = data.count
        const icon = getIdenticon(pub)

        postsStore.resetPositionAndPosts()
        const posts = await postsStore.getPostsForKeys([pub])

        let uidw

        if (posts.length) {
            uidw = posts[0].uidw
        }

        return {
            uidw,
            posts,
            icon,
            username,
            pub,
            followers,
        }
    }

    async componentDidMount(): Promise<void> {
        window.scrollTo(0, 0)
        this.props.tagStore.destroyActiveTag()
        this.props.uiStore.toggleSidebarStatus(false)
        this.props.uiStore.toggleBannerStatus(true)

        if (!this.state.isFirstRender) {
            await this.props.postsStore.getPostsForKeys([this.props.pub])
            this.setState({
                isFirstRender: true,
            })
        }
    }

    @computed get isSameUser() {
        return this.props.username === this.props.authStore.activeDisplayName
    }

    private handleUserFollowing = (user, pub) => {
        if (!this.props.authStore.hasAccount) {
            this.props.uiStore.showToast('You must be logged in follow users', 'error')
            return
        }

        if (!this.isSameUser) {
            this.setState(prevState => ({
                followers: !this.props.userStore.isFollowingUser(pub)
                    ? prevState.followers - 1
                    : prevState.followers + 1,
            }))
        }

        this.props.userStore.toggleUserFollowing(user, pub)
    }

    private handleUserBlock = (user, pub) => {
        this.props.userStore.toggleBlockUser(user, pub)
    }

    private renderFollowingList = () => {
        if (!this.props.userStore.following.size) {
            return (
                <li className={'f6'} key={'none'}>
                    You are not following any users.
                </li>
            )
        }

        const pubs = Array.from(this.props.userStore.following.keys())
        const following = Array.from(this.props.userStore.following.values())

        return following.map((follow, index) => (
            <li className={'pa0 mb2'} key={follow}>
                <span title={pubs[index]} className={'link pr2 pointer dim'}>
                    {follow}
                </span>
                <span
                    onClick={() => this.handleUserFollowing(follow, pubs[index])}
                    title={'Click to unfollow'}
                >
                    <FontAwesomeIcon
                        width={13}
                        icon={faMinusCircle}
                        className={'pointer dim'}
                        color={'red'}
                    />
                </span>
            </li>
        ))
    }

    private addAsModerator = () => {
        const usernameWithKey = `${this.props.username}:${this.props.pub}`
        this.props.userStore.setModerationMemberByTag(usernameWithKey)
    }

    private renderSidebarContent = () => {
        const {
            icon,
            username,
            pub,
            uidw,
            followers,
            postsStore: { getPlausibleTagOptions },
            authStore: { hasAccount },
            userStore: {
                delegated,
                isFollowingUser,
                isUserBlocked,
                activeDelegatedTag,
                setActiveDelegatedTag,
            },
        } = this.props

        return (
            <>
                <div className={'flex flex-row items-center flex-wrap'}>
                    <img
                        width={100}
                        height={100}
                        src={icon}
                        className={'post-icon mr3'}
                        alt={'Icon'}
                    />
                    <div className={'flex flex-column items-start justify-center'}>
                        <span className={'b black f5 mb2'}>{username}</span>
                        <span className={'b f6 mb2'}>{this.state.followers} Followers</span>
                        {!this.isSameUser && hasAccount && (
                            <button
                                title={isFollowingUser(pub) ? 'Unfollow user' : 'Follow user'}
                                className={'button-outline'}
                                onClick={() => this.handleUserFollowing(username, pub)}
                            >
                                {isFollowingUser(pub) ? 'Unfollow' : 'Follow'}
                            </button>
                        )}
                    </div>
                </div>
                <div className={'mt4 flex flex-column'}>
                    <span className={'small-title mb2'}>Wallets</span>

                    <ul className={'list'}>
                        <li className={'pa0 mb2'} title={uidw}>
                            {typeof uidw === 'string' ? <CopyToClipboard value={uidw} /> : '--'}
                        </li>
                    </ul>
                </div>
                {!this.isSameUser && hasAccount && (
                    <div className={'mt4 flex flex-column'}>
                        <span className={'small-title mb2'}>Options</span>

                        <ul className={'list lh-copy'}>
                            <li
                                className={'red f6 pointer dim'}
                                onClick={() => this.handleUserBlock(username, pub)}
                            >
                                <button
                                    className={
                                        'mt1 w-100 f6 link dim ph3 pv2 dib white bg-red pointer'
                                    }
                                    type="submit"
                                >
                                    {isUserBlocked(pub) ? 'Unblock User' : 'Block User'}
                                </button>
                            </li>
                            <li className={'f6 mt2'}>
                                <TagDropdown
                                    className={'f6'}
                                    formatCreateLabel={() => `Choose a tag`}
                                    onChange={setActiveDelegatedTag}
                                    value={activeDelegatedTag}
                                    options={[
                                        { value: 'all', label: '#all' },
                                        ...getPlausibleTagOptions,
                                    ]}
                                />
                                <button
                                    className={
                                        'mt1 w-100 f6 link dim ph3 pv2 dib white bg-green pointer'
                                    }
                                    type="submit"
                                    onClick={this.addAsModerator}
                                >
                                    {delegated.has(`${username}:${pub}:${activeDelegatedTag.value}`)
                                        ? 'Remove as moderator'
                                        : 'Add as moderator'}
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
                {this.isSameUser && (
                    <div className={'mt4 flex flex-column'}>
                        <span className={'small-title mb2'}>Following (only visible to you)</span>

                        <ul className={'list'}>{this.renderFollowingList()}</ul>
                    </div>
                )}
            </>
        )
    }

    private renderUsersPosts = () => {
        const { pub, posts } = this.props

        const {
            getPostsForKeys,
            postsPosition: { cursorId, items },
        } = this.props.postsStore

        return (
            <InfiniteScrollFeed
                withAnchorUid
                dataLength={items}
                hasMore={cursorId !== 0}
                next={() => getPostsForKeys([pub])}
                posts={posts}
            />
        )
    }

    public render(): React.ReactNode {
        return (
            <div className={'flex flex-row'}>
                <div className={'card w-30 mr3 pa3'} style={{ maxHeight: '90vh' }}>
                    {this.renderSidebarContent()}
                </div>
                <div className={'w-70'}>
                    <Tabs selectedIndex={1} onSelect={index => console.log(index)}>
                        <TabList className={'settings-tabs'}>
                            <Tab className={'settings-tab'}>Blog</Tab>
                            <Tab className={'settings-tab'}>Posts</Tab>
                            <Tab className={'settings-tab'}>Latest</Tab>
                        </TabList>

                        <div className={'mt3'}>
                            <TabPanel>
                                <div className={'card settings-card'}>
                                    There are no blog posts from this uer.
                                </div>
                            </TabPanel>
                            <TabPanel>{this.renderUsersPosts()}</TabPanel>
                            <TabPanel>
                                <div className={'card settings-card'}>
                                    There are no posts from this user.
                                </div>
                            </TabPanel>
                        </div>
                    </Tabs>
                </div>
            </div>
        )
    }
}

export default U
