import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, TagDropdown, UserNameWithIcon } from '@components'
import { IStores } from '@stores'
import classNames from 'classnames'
import './style.scss'
import { getIdenticon } from '@utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinusCircle, faPlus } from '@fortawesome/free-solid-svg-icons'

interface ISettings {
    settingsStore: IStores['settingsStore']
    postsStore: IStores['postsStore']
    uiStore: IStores['uiStore']
}

// TODO: Real Data

interface ISettingsState {
    activeSidebar: string
    moderation: {
        user: string
    }
}

@inject('settingsStore', 'postsStore', 'uiStore')
@observer
class Settings extends React.Component<ISettings, ISettingsState> {
    static async getInitialProps({ store, res }) {
        const uiStore: IStores['uiStore'] = store.uiStore
        const tagStore: IStores['tagStore'] = store.tagStore
        const authStore: IStores['authStore'] = store.authStore

        uiStore.toggleSidebarStatus(false)
        tagStore.destroyActiveTag()

        return {}
    }

    state = {
        activeSidebar: 'Moderation',
        moderation: {
            user: '',
        },
    }

    setLinkAsActive = link => {
        this.setState({
            activeSidebar: link,
        })
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
        const { airdropForm } = this.props.settingsStore

        return <Form form={airdropForm} />
    }

    private renderContent = () => {
        switch (this.state.activeSidebar) {
            case 'Connections':
                return this.renderConnections()
            case 'Moderation':
                return this.renderModeration()
            case 'Airdrop':
                return this.renderAirdrop()
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
