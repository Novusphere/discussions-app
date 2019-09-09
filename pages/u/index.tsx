import * as React from 'react'
import { dummy } from '@novuspherejs'
import { IStores } from '@stores'
import { inject, observer } from 'mobx-react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

interface IUPageProps {
    uiStore: IStores['uiStore']
    username: string
    data: any
}

@inject('uiStore')
@observer
class U extends React.Component<IUPageProps> {
    static async getInitialProps({ query, store }) {
        const uiStore: IStores['uiStore'] = store.uiStore
        uiStore.toggleSidebar()
        const userData = await dummy.getUser(query.username)
        return {
            username: query.username,
            data: userData,
        }
    }

    componentWillUnmount(): void {
        this.props.uiStore.toggleSidebar()
    }

    private renderSidebarContent = () => {
        return (
            <>
                <div className={'flex flex-row items-center'}>
                    <img
                        className={'br-100'}
                        src={'https://via.placeholder.com/100x100'}
                        alt={'User profile image'}
                    />
                    <div className={'ml3 flex flex-column items-start justify-center'}>
                        <span className={'b black f5 mb2'}>{this.props.username}</span>
                        <span className={'b f6 mb2'}>192 Followers</span>
                        <button className={'button-outline'}>Follow</button>
                    </div>
                </div>

                <div className={'mt4 flex flex-column'}>
                    <span className={'small-title mb2'}>Contacts</span>

                    <ul className={'list'}>
                        <li className={'pa0 mb2'}>@{this.props.username}</li>
                        <li className={'pa0 mb2'}>{this.props.username}</li>
                        <li className={'pa0 mb2'}>{this.props.username}</li>
                        <li className={'pa0 mb2'}>{this.props.username}.com</li>
                    </ul>
                </div>

                <div className={'mt4 flex flex-column'}>
                    <span className={'small-title mb2'}>Connected Accounts</span>

                    <ul className={'list'}>
                        <li className={'pa0 mb2'}>EOS</li>
                    </ul>
                </div>
            </>
        )
    }

    public render(): React.ReactNode {
        const { data } = this.props

        return (
            <div className={'flex flex-row'}>
                <div className={'card w-30 mr2 pa3'}>{this.renderSidebarContent()}</div>
                <div className={'w-70 pa3'}>
                    <Tabs>
                        <TabList className={'settings-tabs'}>
                            <Tab className={'settings-tab'}>Blog</Tab>
                            <Tab className={'settings-tab'}>Posts</Tab>
                            <Tab className={'settings-tab'}>Latest</Tab>
                        </TabList>

                        <TabPanel>
                            <div className={'card settings-card'}>
                                There are no blog posts from this uer.
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className={'card settings-card'}>
                                There are no posts from this user.
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className={'card settings-card'}>
                                There are no posts from this user.
                            </div>
                        </TabPanel>
                    </Tabs>
                </div>
            </div>
        )
    }
}


export default U
