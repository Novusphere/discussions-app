import React, { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { observer, useObserver } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import cx from 'classnames'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import _ from 'lodash'
import { Form, Icon, Input, Tabs, Button, Typography } from 'antd'
const { Paragraph, Text } = Typography
const { TabPane } = Tabs
import { Tab, TabList } from 'react-tabs'

const Connections = () => {
    const { authStore }: RootStore = useStores()

    return (
        <>
            <div className={'flex flex-row items-center justify-between'}>
                <span className={'db'}>
                    <span className={'db b black f6'}>EOS Wallet</span>
                    <span className={'db silver f6'}>
                        You can connect your EOS wallets to Discussions App.
                    </span>
                </span>
                <span
                    className={'db primary pointer'}
                    onClick={() => authStore.connectScatterWallet(authStore.hasEOSWallet)}
                >
                    {useObserver(() => (
                        <>
                            {!authStore.connectScatterWallet['pending'] ? (
                                authStore.hasEOSWallet ? (
                                    '(disconnect)'
                                ) : (
                                    '(connect)'
                                )
                            ) : (
                                <Icon type="loading" />
                            )}
                        </>
                    ))}
                </span>
            </div>
        </>
    )
}

const UnwrappedWallet = ({ form }) => {
    const { getFieldDecorator } = form
    const { authStore }: RootStore = useStores()

    return (
        <>
            <div className={'db'}>
                <Tabs
                    defaultActiveKey="1"
                    renderTabBar={props => {
                        return (
                            <TabList
                                className={
                                    'list ma0 pa0 flex flex-row items-center justify-stretch card mb3 mh1'
                                }
                            >
                                {props['panels'].map(panel => (
                                    <Tab
                                        key={panel.key}
                                        className={cx([
                                            'w-100 bg-white pa3 tc b pointer',
                                            {
                                                'bg-primary white':
                                                    props['activeKey'] === panel.key,
                                            },
                                        ])}
                                        {...panel.props}
                                        onClick={e => props.onTabClick(panel.key, e)}
                                    >
                                        {panel.props.tab}
                                    </Tab>
                                ))}
                            </TabList>
                        )
                    }}
                >
                    <TabPane tab="Deposit" key="1">
                        <div className={'ba b--light-gray pa3 br3'}>
                            <Form
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 16, offset: 4 }}
                                onSubmit={() => console.log('hey')}
                                className={'center'}
                            >
                                <Form.Item label="Token">
                                    {getFieldDecorator('token', {
                                        rules: [
                                            {
                                                required: true,
                                                message: 'Please select a token',
                                            },
                                        ],
                                    })(
                                        <Input
                                            size={'large'}
                                            placeholder={
                                                'Enter the password you used to encrypt your keys'
                                            }
                                            type={'password'}
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label="Amount">
                                    {getFieldDecorator('amount', {
                                        rules: [
                                            {
                                                required: true,
                                                message: 'Please enter an amount',
                                            },
                                        ],
                                    })(<Input size={'large'} style={{ width: '100%' }} />)}
                                </Form.Item>
                            </Form>

                            <div className={'mt3 flex flex-row justify-end'}>
                                <Button type={'primary'}>Submit Deposit</Button>
                            </div>

                            <div className={'mt5'}>
                                <span className={'light-silver f6'}>
                                    Alternatively, to manually deposit funds from your wallet or an
                                    exchange please send them to
                                </span>

                                <div className={'center db mw6 mv4'}>
                                    <div
                                        className={
                                            'flex flex-row items-center justify-between mb3'
                                        }
                                    >
                                        <span className={'f6 b'}>Account</span>
                                        <Text ellipsis copyable>
                                            Hey
                                        </Text>
                                    </div>

                                    <div
                                        className={
                                            'flex flex-row items-center justify-between mb3'
                                        }
                                    >
                                        <span className={'f6 b'}>Memo</span>
                                        <Text ellipsis copyable>
                                            {authStore.uidwWalletPubKey}
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            <div className={'mt3'}>
                                <span className={'light-silver f6'}>
                                    <strong>Please note:</strong> It's important you use this memo
                                    EXACTLY! If you are depositing from an exchange and cannot
                                    specify a memo then you must first withdraw to an EOS wallet of
                                    your own first!
                                </span>
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab="Transfer" key="2">
                        Content of Tab Pane 2
                    </TabPane>
                    <TabPane tab="Withdrawal" key="3">
                        Content of Tab Pane 3
                    </TabPane>
                </Tabs>
            </div>
        </>
    )
}

const Wallet = Form.create({ name: 'depositForm' })(UnwrappedWallet)

const Setting = dynamic(
    () =>
        Promise.resolve(({ page }: any) => {
            switch (page) {
                case 'connections':
                    return <Connections />
                case 'wallet':
                    return <Wallet />
                default:
                    return <span>Hey</span>
            }
        }),
    {
        ssr: false,
    }
)

const className = (current, page) =>
    cx([
        'f6 ph4 pv2 pointer dim',
        {
            'bg-near-white': current === page,
        },
    ])

const SettingsPage: NextPage<any> = ({ page }) => {
    const { uiStore, postsStore, userStore, authStore, tagStore }: RootStore = useStores()

    useEffect(() => {
        uiStore.setSidebarHidden('true')

        return () => {
            uiStore.setSidebarHidden('false')
        }
    }, [])

    return (
        <div className={'flex flex-row'}>
            <div className={'w-30 vh-75 bg-white card'}>
                <div className={'db'}>
                    <span className={'db f6 b black ph4 pt4'}>Settings</span>

                    <ul className={'list pa0 ma0 mt3'}>
                        <li className={className(page, 'connections')}>
                            <Link
                                href={'/settings/[settings]'}
                                as={'/settings/connections'}
                                shallow={true}
                            >
                                <a className={'gray'}>Connections</a>
                            </Link>
                        </li>
                        <li className={className(page, 'wallet')}>
                            <Link
                                href={'/settings/[settings]'}
                                as={'/settings/wallet'}
                                shallow={true}
                            >
                                <a className={'gray'}>Wallet</a>
                            </Link>
                        </li>
                        <li className={className(page, 'moderation')}>
                            <Link
                                href={'/settings/[settings]'}
                                as={'/settings/moderation'}
                                shallow={true}
                            >
                                <a className={'gray'}>Moderation</a>
                            </Link>
                        </li>
                        <li className={className(page, 'airdrop')}>
                            <Link
                                href={'/settings/[settings]'}
                                as={'/settings/airdrop'}
                                shallow={true}
                            >
                                <a className={'gray'}>Airdrop</a>
                            </Link>
                        </li>
                        <li className={className(page, 'blocked')}>
                            <Link
                                href={'/settings/[settings]'}
                                as={'/settings/blocked'}
                                shallow={true}
                            >
                                <a className={'gray'}>Blocked</a>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className={'fl ml3 w-70 bg-white card pa4'}>
                <span className={'f4 b black db mb3'}>{_.startCase(page)}</span>
                <Setting page={page} />
            </div>
        </div>
    )
}

SettingsPage.getInitialProps = async function({ query }) {
    const page = query.setting
    return {
        page,
    }
}

export default observer(SettingsPage)
