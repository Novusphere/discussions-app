import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { Form } from '@components'
import { IStores } from '@stores/index'

interface ISettings {
    settingsStore: IStores['settingsStore']
}

@inject('settingsStore')
@observer
class Settings extends React.Component<ISettings> {
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
