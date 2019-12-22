import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, TagDropdown, UserNameWithIcon } from '@components'
import { IStores } from '@stores'
import classNames from 'classnames'
import './style.scss'
import { getIdenticon } from '@utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinusCircle, faPlus } from '@fortawesome/free-solid-svg-icons'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import Link from 'next/link'

interface ISettings {
    settingsStore: IStores['settingsStore']
    postsStore: IStores['postsStore']
    uiStore: IStores['uiStore']
    userStore: IStores['userStore']
    tagStore: IStores['tagStore']
}

// TODO: Real Data

interface ISettingsState {
    activeSidebar: string
    tokens: {
        activeIndex: number
    }
    moderation: {
        user: string
    }
}

@inject('settingsStore', 'postsStore', 'uiStore', 'userStore', 'tagStore')
@observer
class Settings extends React.Component<ISettings, ISettingsState> {
    static async getInitialProps({ store, res }) {
        const uiStore: IStores['uiStore'] = store.uiStore
        const tagStore: IStores['tagStore'] = store.tagStore

        uiStore.toggleSidebarStatus(false)
        tagStore.destroyActiveTag()

        return {}
    }

    state = {
        activeSidebar: 'Blocked',
        tokens: {
            activeIndex: 0,
        },
        moderation: {
            user: '',
        },
    }

    setLinkAsActive = link => {
        this.setState({
            activeSidebar: link,
        })
    }

    componentWillUnmount(): void {
        this.props.settingsStore.thresholdTxID = ''
        this.props.settingsStore.errorMessage = ''
    }

    private renderSidebarContent = () => {
        return (
            <>
                <span className={'b black f5 sidebar'}>Settings</span>
                <ul className={'list ph2 mt3'}>
                    {[
                        {
                            name: 'Connections',
                        },
                        {
                            name: 'Tokens',
                        },
                        {
                            name: 'Moderation',
                        },
                        {
                            name: 'Airdrop',
                        },
                        {
                            name: 'Blocked',
                        },
                    ].map(link => (
                        <li
                            onClick={() => this.setLinkAsActive(link.name)}
                            className={classNames([
                                'ph3 dim pv2 pointer',
                                {
                                    'sidebar-link-active': this.state.activeSidebar === link.name,
                                },
                            ])}
                            key={link.name}
                        >
                            <span>{link.name}</span>
                        </li>
                    ))}
                </ul>
            </>
        )
    }

    private renderConnections = () => (
        <>
            <div className={'mt3'}>
                <div className={'flex flex-row justify-between items-center bb b--light-gray pv3'}>
                    <span className={'flex flex-column tl mr4'}>
                        <span className={'b black f5 pb2'}>You are connected to Facebook</span>
                        <span className={'f6 lh-copy'}>
                            You can now post to your Facebook account whenever you post or comment
                            on EOS. We will never post to Facebook or message your friends without
                            your permission.
                        </span>
                    </span>

                    <span className={'flex flex-column tr'}>
                        <span className={'black b f6'}>Sahil Kohja</span>
                        <span className={'red f6'}>(disconnect)</span>
                    </span>
                </div>

                <div className={'flex flex-row justify-between items-center pv3'}>
                    <span className={'flex flex-column tl mr4'}>
                        <span className={'b black f5 pb2'}>You are connected to Twitter</span>
                        <span className={'f6 lh-copy'}>
                            You can now post to your Twitter account whenever you post or comment on
                            EOS. We will never post to Twitter or message your friends without your
                            permission.
                        </span>
                    </span>

                    <span className={'flex flex-column tr'}>
                        <span className={'black b f6'}>--</span>
                        <span className={'green f6'}>(connect)</span>
                    </span>
                </div>
            </div>
        </>
    )

    private handleModerationTagOnChange = option => {
        this.props.settingsStore.moderationSubValue = option
    }

    private handleUserOnChange = e => {
        this.setState({
            moderation: {
                user: e.target.value,
            },
        })
    }

    private handleAddUserToModeration = () => {
        this.props.settingsStore.moderationMembers.push(this.state.moderation.user)
        this.setState({
            moderation: {
                user: '',
            },
        })
    }

    private handleDeleteUserToModeration = user => {
        this.props.settingsStore.moderationMembers.remove(user)
    }

    private renderModeration = () => {
        const { moderationSubValue } = this.props.settingsStore
        const { getPlausibleTagOptions } = this.props.postsStore

        return (
            <>
                <div className={'mt3'}>
                    <TagDropdown
                        formatCreateLabel={inputValue => `Choose a tag`}
                        onChange={this.handleModerationTagOnChange}
                        value={moderationSubValue}
                        options={getPlausibleTagOptions}
                    />
                    <div className={'outline-container mt3'}>
                        <div className={'flex flex-column space-between'}>
                            <div className={'mb3'}>
                                {this.props.settingsStore.moderationMembers.toJSON().map(item => (
                                    <span
                                        className={
                                            'flex items-center justify-between pv3 ph2 bb b--light-gray'
                                        }
                                        key={item}
                                    >
                                        <UserNameWithIcon
                                            imageData={getIdenticon()}
                                            name={item}
                                            pub={item}
                                        />
                                        <span
                                            onClick={() => this.handleDeleteUserToModeration(item)}
                                            title={'Remove user from moderation'}
                                        >
                                            <FontAwesomeIcon
                                                width={13}
                                                icon={faMinusCircle}
                                                className={'pointer dim'}
                                                color={'red'}
                                            />
                                        </span>
                                    </span>
                                ))}
                            </div>
                            <div
                                className={
                                    'field-container mb2 relative flex-auto flex items-center'
                                }
                            >
                                <input
                                    value={this.state.moderation.user}
                                    onChange={this.handleUserOnChange}
                                    className={'w-100'}
                                    placeholder={'Enter a user'}
                                />
                                <span
                                    onClick={this.handleAddUserToModeration}
                                    className={'plus-icon absolute dim pointer'}
                                >
                                    <FontAwesomeIcon
                                        width={13}
                                        icon={faPlus}
                                        title={'Click to add a user'}
                                    />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    private renderAirdrop = () => {
        const {
            airdropForm,
            recipientCount,
            thresholdTxID,
            errorMessage,
        } = this.props.settingsStore

        return (
            <>
                <Form form={airdropForm} hideSubmitButton className={'relative'}>
                    <span className={'b absolute rc-container'}>Recipients: {recipientCount}</span>
                </Form>
                {thresholdTxID && (
                    <span className={'w-100 flex items-center justify-end'}>
                        <a
                            target={'_blank'}
                            href={`https://eosq.app/tx/${thresholdTxID}`}
                            className={'pt3 b f6 success'}
                        >
                            Success! Your transaction has been submitted, click here to view!
                        </a>
                    </span>
                )}
                {errorMessage && (
                    <span className={'w-100 red flex items-center justify-end'}>
                        {errorMessage}
                    </span>
                )}
            </>
        )
    }

    private renderTokens = () => {
        const { activeIndex } = this.state.tokens
        const { depositForm, withdrawalForm } = this.props.settingsStore

        return (
            <Tabs
                className={'mt2'}
                selectedIndex={activeIndex}
                onSelect={index => this.setState({ tokens: { activeIndex: index } })}
            >
                <TabList className={'settings-tabs'}>
                    <Tab className={'settings-tab'}>Withdrawal</Tab>
                    <Tab className={'settings-tab'}>Deposit</Tab>
                </TabList>

                <TabPanel>
                    <div className={'flex flex-column items-center'}>
                        <input
                            placeholder={'0'}
                            className={'token-amount-box mt3 f1 gray b--transparent tc'}
                            onChange={event =>
                                withdrawalForm.form.$('amount').set('value', event.target.value)
                            }
                        />
                        <div
                            className={
                                'w-100 flex flex-column items-center outline-container pa4 mt3'
                            }
                        >
                            <Form className={'db w-100'} form={withdrawalForm} hideSubmitButton />
                            <button
                                title={'Submit withdrawal'}
                                className={'flex'}
                                onClick={withdrawalForm.onSubmit}
                            >
                                <span className={'f6 white'}>Withdraw</span>
                            </button>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel>
                    <div className={'flex flex-column items-center'}>
                        <input
                            placeholder={'0'}
                            className={'token-amount-box mt3 f1 gray b--transparent tc'}
                            onChange={event =>
                                depositForm.form.$('amount').set('value', event.target.value)
                            }
                        />
                        <div
                            className={
                                'w-100 flex flex-column items-center outline-container pa4 mt3'
                            }
                        >
                            <Form className={'db w-100'} form={depositForm} hideSubmitButton />
                            <button
                                title={'Submit deposit'}
                                className={'flex'}
                                onClick={depositForm.onSubmit}
                            >
                                <span className={'f6 white'}>Deposit</span>
                            </button>
                        </div>
                    </div>
                </TabPanel>
            </Tabs>
        )
    }

    private renderBlocked = () => {
        const { blockedPosts, blockedUsers } = this.props.userStore
        const {
            blockedContentSetting,
            setBlockedContentSetting,
            blockedSettingForm,
        } = this.props.settingsStore
        const { tags } = this.props.tagStore

        const blockedPostsAsArray = Array.from(blockedPosts.keys())
        const blockedUsersAsArray = Array.from(blockedUsers.keys())

        return (
            <>
                <div className={'mb4 db'}>
                    <h3>Display Blocked Content</h3>
                    <span className={'silver f6'}>
                        Here you can set how you wish to view blocked content.
                    </span>
                    <Form form={blockedSettingForm} hideSubmitButton className={'mt3'} />
                </div>
                <hr />
                <h3>Users</h3>
                {!blockedUsersAsArray.length ? (
                    <span className={'moon-gray f6 i'}>You have no blocked users</span>
                ) : (
                    <div className={'outline-container mt3'}>
                        <div className={'flex flex-column space-between'}>
                            <div className={'mb3'}>
                                {blockedUsersAsArray.map((pub, index, array) => (
                                    <span
                                        className={classNames([
                                            'flex items-center justify-between ph2',
                                            {
                                                'bb b--light-gray pv3': index !== array.length - 1,
                                                pt3: index === array.length - 1,
                                            },
                                        ])}
                                        key={pub}
                                    >
                                        <UserNameWithIcon
                                            imageData={getIdenticon(pub)}
                                            name={blockedUsers.get(pub)}
                                            pub={pub}
                                        />
                                        <span
                                            onClick={() => blockedUsers.delete(pub)}
                                            title={'Unblock User'}
                                        >
                                            <FontAwesomeIcon
                                                width={13}
                                                icon={faMinusCircle}
                                                className={'pointer dim'}
                                                color={'red'}
                                            />
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <h3>Posts</h3>
                {!blockedPostsAsArray.length ? (
                    <span className={'moon-gray f6 i'}>You have no blocked posts</span>
                ) : (
                    <div className={'outline-container mt3'}>
                        <div className={'flex flex-column space-between'}>
                            <div className={'mb3'}>
                                {blockedPostsAsArray.map((url, index, array) => (
                                    <span
                                        className={classNames([
                                            'flex items-center justify-between ph2',
                                            {
                                                'bb b--light-gray pv3': index !== array.length - 1,
                                                pt3: index === array.length - 1,
                                            },
                                        ])}
                                        key={url}
                                    >
                                        <Link href={'/tag/[name]/[id]/[title]'} as={url}>
                                            <a className={'flex flex-row items-center'}>
                                                <img
                                                    className={'tag-icon pr2'}
                                                    src={tags.get(url.split('/')[2]).icon}
                                                />
                                                <span>{url}</span>
                                            </a>
                                        </Link>
                                        <span
                                            onClick={() => blockedPosts.delete(url)}
                                            title={'Unblock Post'}
                                        >
                                            <FontAwesomeIcon
                                                width={13}
                                                icon={faMinusCircle}
                                                className={'pointer dim'}
                                                color={'red'}
                                            />
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
    }

    private renderContent = () => {
        switch (this.state.activeSidebar) {
            case 'Connections':
                return this.renderConnections()
            case 'Moderation':
                return this.renderModeration()
            case 'Airdrop':
                return this.renderAirdrop()
            case 'Tokens':
                return this.renderTokens()
            case 'Blocked':
                return this.renderBlocked()
        }
    }

    public render() {
        return (
            <div className={'flex flex-row relative'}>
                <div className={'card w-30 mr3 pa3'}>{this.renderSidebarContent()}</div>
                <div className={'card w-70 pa4'}>
                    <span className={'b black f4'}>{this.state.activeSidebar}</span>
                    {this.renderContent()}
                </div>
            </div>
        )
    }
}

export default Settings
