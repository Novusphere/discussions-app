import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { Form } from '@components'
import { IStores } from '@stores'

interface ISettings {
    settingsStore: IStores['settingsStore']
    postsStore: IStores['postsStore']
    uiStore: IStores['uiStore']
}

// TODO: Real Data

@inject('settingsStore', 'postsStore', 'uiStore')
@observer
class Settings extends React.Component<ISettings> {
    static async getInitialProps({ store }) {
        const uiStore: IStores['uiStore'] = store.uiStore
        const tagStore: IStores['tagStore'] = store.tagStore
        uiStore.toggleSidebarStatus(false)
        tagStore.destroyActiveTag()
        return {}
    }

    private renderSetIdComponent = () => {
        const { setIdForm } = this.props.settingsStore
        return (
            <>
                <span className={'lh-copy'}>
                    Use this panel to set your ID. This is used when posting anonymously to identify
                    your posts. You can regenerate a new ID / Key at any time.
                </span>
                <Form form={setIdForm} hideSubmitButton className={'mv3'} />
            </>
        )
    }

    private renderModerationComponent = () => {
        const { moderationForm } = this.props.settingsStore
        return (
            <>
                <span className={'lh-copy'}>
                    Use this panel to control your delegated moderation settings.
                    <a
                        href={'https://github.com/Novusphere/eos-forum-mod-list'}
                        title={'Click to learn more'}
                    >
                        Click here to learn more
                    </a>
                    .
                </span>
                <Form form={moderationForm} hideSubmitButton className={'mv3'} />
            </>
        )
    }

    private renderRawComponent = () => {
        const { rawForm } = this.props.settingsStore
        return (
            <>
                <span className={'lh-copy'}>
                    <span className={'b'}>Warning:</span> You should not modify these settings
                    unless you know what you're doing! If you incorrectly change something, click
                    "reset" then "save" to restore the default settings.
                </span>
                <Form form={rawForm} hideSubmitButton />
            </>
        )
    }

    private renderAccountComponent = () => {
        return <span>Test</span>
    }

    componentWillUnmount(): void {
        this.props.postsStore.clearPreview()
    }

    private renderSidebarContent = () => {
        return (
            <>
                <span className={'b black f5'}>Settings</span>
                <ul className={'list mt3'}>
                    <li className={'mb2'}>Connections</li>
                    <li className={'mb2'}>Trade</li>
                </ul>
            </>
        )
    }

    public render() {
        return (
            <div className={'flex flex-row'}>
                <div className={'card w-30 mr5 pa3'}>{this.renderSidebarContent()}</div>
                <div className={'card w-70 pa4'}>
                    <span className={'b black f4'}>Connections</span>

                    <div className={'mt3'}>
                        <div
                            className={
                                'flex flex-row justify-between items-center bb b--light-gray pv3'
                            }
                        >
                            <span className={'flex flex-column tl mr4'}>
                                <span className={'b black f5 pb2'}>
                                    You are connected to Facebook
                                </span>
                                <span className={'f6 lh-copy'}>
                                    You can now post to your Facebook account whenever you post or
                                    comment on EOS. We will never post to Facebook or message your
                                    friends without your permission.
                                </span>
                            </span>

                            <span className={'flex flex-column tr'}>
                                <span className={'black b f6'}>Sahil Kohja</span>
                                <span className={'red f6'}>(disconnect)</span>
                            </span>
                        </div>

                        <div
                            className={
                                'flex flex-row justify-between items-center pv3'
                            }
                        >
                            <span className={'flex flex-column tl mr4'}>
                                <span className={'b black f5 pb2'}>
                                    You are connected to Twitter
                                </span>
                                <span className={'f6 lh-copy'}>
                                    You can now post to your Twitter account whenever you post or
                                    comment on EOS. We will never post to Twitter or message your
                                    friends without your permission.
                                </span>
                            </span>

                            <span className={'flex flex-column tr'}>
                                <span className={'black b f6'}>--</span>
                                <span className={'green f6'}>(connect)</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
        // return (
        //     <div className={'card pa4'}>
        //         <Tabs>
        //             <TabList>
        //                 <Tab>Set ID</Tab>
        //                 <Tab>Moderation</Tab>
        //                 <Tab>Raw</Tab>
        //                 <Tab>Account</Tab>
        //             </TabList>
        //
        //             <TabPanel>{this.renderSetIdComponent()}</TabPanel>
        //             <TabPanel>{this.renderModerationComponent()}</TabPanel>
        //             <TabPanel>{this.renderRawComponent()}</TabPanel>
        //             <TabPanel>{this.renderAccountComponent()}</TabPanel>
        //         </Tabs>
        //     </div>
        // )
    }
}

export default Settings
