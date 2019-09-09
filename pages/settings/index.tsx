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

@inject('settingsStore', 'postsStore', 'uiStore')
@observer
class Settings extends React.Component<ISettings> {
    static async getInitialProps({ store }) {
        const uiStore: IStores['uiStore'] = store.uiStore
        const tagStore: IStores['tagStore'] = store.tagStore
        uiStore.toggleSidebarAndBanner()
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
        this.props.uiStore.toggleSidebarAndBanner()
    }

    public render() {
        return (
            <div className={'card pa4'}>
                <Tabs>
                    <TabList>
                        <Tab>Set ID</Tab>
                        <Tab>Moderation</Tab>
                        <Tab>Raw</Tab>
                        <Tab>Account</Tab>
                    </TabList>

                    <TabPanel>{this.renderSetIdComponent()}</TabPanel>
                    <TabPanel>{this.renderModerationComponent()}</TabPanel>
                    <TabPanel>{this.renderRawComponent()}</TabPanel>
                    <TabPanel>{this.renderAccountComponent()}</TabPanel>
                </Tabs>
            </div>
        )
    }
}

export default Settings
