import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, TagDropdown } from '@components'
import { IStores } from '@stores'
import classNames from 'classnames'

interface ISettings {
    settingsStore: IStores['settingsStore']
    postsStore: IStores['postsStore']
    uiStore: IStores['uiStore']
}

import './style.scss'

// TODO: Real Data

interface ISettingsState {
    activeSidebar: string
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
        activeSidebar: 'Connections',
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

    private renderModeration = () => (
        <>
            <div className={'mt3'}>
                <TagDropdown
                    formatCreateLabel={inputValue => `Choose a tag`}
                    onChange={this.handleModerationTagOnChange}
                    value={this.props.settingsStore.moderationSubValue}
                    options={this.props.postsStore.getPlausibleTagOptions}
                />
            </div>
        </>
    )

    private renderContent = () => {
        switch (this.state.activeSidebar) {
            case 'Connections':
                return this.renderConnections()
            case 'Moderation':
                return this.renderModeration()
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
