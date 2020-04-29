import React, { FunctionComponent } from 'react'

import styles from './SettingsAmbassadors.module.scss'
import cx from 'classnames'
import { Tabs, Form, Input, Button, Checkbox, Table, Collapse, Avatar, Switch, Icon } from 'antd'
import { Tab, TabList } from 'react-tabs'
import { useObserver } from 'mobx-react-lite'

const { TabPane } = Tabs
const { Panel } = Collapse

interface ISettingsAmbassadorsProps {}

const PersonalInfo = Form.create({ name: 'personal_info' })(({ form }: any) => {
    const { getFieldDecorator } = form

    return (
        <>
            <Form.Item label="Name">
                {getFieldDecorator('username', {
                    rules: [
                        {
                            required: true,
                            message: 'Please input your name',
                        },
                    ],
                })(<Input placeholder="Please input your name" size={'large'} />)}
            </Form.Item>
            <Form.Item label="Email">
                {getFieldDecorator('email', {
                    rules: [
                        {
                            required: false,
                            message: 'Please input your email',
                        },
                    ],
                })(<Input placeholder="E-mail (optional)" size={'large'} />)}
            </Form.Item>

            <div className={'mt4'}>
                <span className={'flex flex-row items-center justify-between'}>
                    <span className={'f4 b black db mb3'}>
                        Ambassador of the following companies
                    </span>
                </span>
                <div className={'flex flex-row flex-wrap items-center'}>
                    <div className={'flex flex-row items-center'}>
                        <Avatar icon="user" />
                        <div className={'flex flex-column mh2'}>
                            <span className={'f6 primary'}>Company Name</span>
                            <span className={'f6 gray'}>Score: 5643</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
})

const CompanyInfo = Form.create({ name: 'company_info' })(({ form }: any) => {
    const { getFieldDecorator } = form

    return (
        <>
            <Form.Item label="Company Name">
                {getFieldDecorator('companyName', {
                    rules: [
                        {
                            required: true,
                            message: 'Please enter a company name',
                        },
                    ],
                })(<Input size={'large'} />)}
            </Form.Item>
            <Form.Item label="Owner's first name">
                {getFieldDecorator('ownerFirstName', {
                    rules: [
                        {
                            required: false,
                            message: 'Please enter a first name',
                        },
                    ],
                })(<Input size={'large'} />)}
            </Form.Item>
            <Form.Item label="Owner's last name">
                {getFieldDecorator('ownerLastName', {
                    rules: [
                        {
                            required: false,
                            message: 'Please enter a last name',
                        },
                    ],
                })(<Input size={'large'} />)}
            </Form.Item>

            <div className={'mt4'}>
                <span className={'flex flex-row items-center justify-between'}>
                    <span className={'f4 b black db mb3'}>Company Address (optional)</span>
                </span>
                <Form.Item label="Street">
                    {getFieldDecorator('street', {
                        rules: [
                            {
                                required: false,
                                message: 'Please enter a street address',
                            },
                        ],
                    })(<Input size={'large'} />)}
                </Form.Item>
                <Form.Item label="Building Number">
                    {getFieldDecorator('buildingNumber', {
                        rules: [
                            {
                                required: false,
                                message: 'Please enter a building number',
                            },
                        ],
                    })(<Input size={'large'} />)}
                </Form.Item>
                <Form.Item label="Area Code">
                    {getFieldDecorator('areaCode', {
                        rules: [
                            {
                                required: false,
                                message: 'Please enter an area code',
                            },
                        ],
                    })(<Input size={'large'} />)}
                </Form.Item>
                <Form.Item label="City">
                    {getFieldDecorator('city', {
                        rules: [
                            {
                                required: false,
                                message: 'Please enter a city name',
                            },
                        ],
                    })(<Input size={'large'} />)}
                </Form.Item>
            </div>

            <div className={'mt4'}>
                <span className={'flex flex-row items-center justify-between'}>
                    <span className={'f4 b black db mb3'}>Social</span>
                </span>
                <Tabs defaultActiveKey="2">
                    <TabPane
                        tab={
                            <span>
                                <Icon type="twitter" />
                                Twitter
                            </span>
                        }
                        key="1"
                    >
                        <Form.Item label="Twitter Username">
                            {getFieldDecorator('twitterUsername', {
                                rules: [
                                    {
                                        required: false,
                                        message: 'Please enter a valid Twitter username i.e. @eos',
                                    },
                                ],
                            })(<Input size={'large'} />)}
                        </Form.Item>
                        <Form.Item label="Profile URL">
                            {getFieldDecorator('twitterProfileURL', {
                                rules: [
                                    {
                                        required: false,
                                        message: 'Please enter a valid Twitter profile URL',
                                    },
                                ],
                            })(<Input size={'large'} />)}
                        </Form.Item>
                    </TabPane>
                    <TabPane
                        tab={
                            <span>
                                <Icon type="facebook" />
                                Facebook
                            </span>
                        }
                        key="2"
                    >
                        <Form.Item label="Facebook Username">
                            {getFieldDecorator('facebookUsername', {
                                rules: [
                                    {
                                        required: false,
                                        message: 'Please enter a valid Facebook username i.e. @eos',
                                    },
                                ],
                            })(<Input size={'large'} />)}
                        </Form.Item>
                        <Form.Item label="Profile URL">
                            {getFieldDecorator('facebookProfileURL', {
                                rules: [
                                    {
                                        required: false,
                                        message: 'Please enter a valid Facebook profile URL',
                                    },
                                ],
                            })(<Input size={'large'} />)}
                        </Form.Item>
                    </TabPane>
                </Tabs>
            </div>

            <div className={'mt4'}>
                <span className={'flex flex-row items-center justify-between'}>
                    <span className={'f4 b black db mb3'}>Contact</span>
                </span>
                <Form.Item label="Phone">
                    {getFieldDecorator('phone', {
                        rules: [
                            {
                                required: false,
                                message: 'Please enter a valid phone number',
                            },
                        ],
                    })(<Input size={'large'} />)}
                </Form.Item>
                <Form.Item label="Email">
                    {getFieldDecorator('email', {
                        rules: [
                            {
                                required: false,
                                message: 'Please enter a valid email address',
                            },
                        ],
                    })(<Input size={'large'} />)}
                </Form.Item>
            </div>

            <div className={'mt4'}>
                <span className={'flex flex-row items-center justify-between'}>
                    <span className={'f4 b black db mb3'}>Availability Status</span>
                </span>
                <Switch checked={true} onChange={change => console.log(change)} />
            </div>

            <div className={'mt4'}>
                <span className={'flex flex-row items-center justify-between'}>
                    <span className={'f4 b black db mb3'}>
                        Ambassador of the following companies
                    </span>
                </span>
                <div className={'flex flex-row flex-wrap items-center'}>
                    <div className={'flex flex-row items-center'}>
                        <Avatar icon="user" />
                        <div className={'flex flex-column mh2'}>
                            <span className={'f6 primary'}>Company Name</span>
                            <span className={'f6 gray'}>Score: 5643</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
})

const Applicants = () => {
    const columns = [
        { title: '#', dataIndex: 'key', key: 'key' },
        {
            title: "Ambassador's Username",
            dataIndex: 'username',
            key: 'username',
            render: text => (
                <span className={'flex flex-row items-center'}>
                    <Avatar />
                    <span className={'primary f6 ph2'}>{text}</span>
                </span>
            ),
        },
    ]

    const data = [
        {
            key: 1,
            username: 'hellodarknes',
            firstName: 'John',
            lastName: 'Smith',
            street: '5th Avenue',
            buildingNumber: '234/45',
            areaCode: '768765',
            city: 'New York',
            twitterUsername: 'Discussion_Guru',
            twitterProfileURL: 'https://www.discussions.app',
            facebookUsername: 'Discussion_Guru',
            facebookProfileURL: 'https://www.discussions.app',
            phoneNumber: '+48 689 67 76 76',
            email: 'hello@apple.com',
            totalScore: 645765,
            ambassadors: [
                {
                    companyName: 'Company Name',
                    score: 5643,
                },
            ],
        },
    ]

    return (
        <Table
            columns={columns}
            expandedRowRender={record => {
                return (
                    <>
                        <div className={'flex flex-row items-center flex-wrap'}>
                            <span className={'db pr3 pb3 w5'}>
                                <span className={'db f6 black'}>Ambassador's First Name</span>
                                <span className={'db f5 black b'}>{record.firstName}</span>
                            </span>
                            <span className={'db pr3 pb3 w5'}>
                                <span className={'db f6 black'}>Ambassador's Last Name</span>
                                <span className={'db f5 black b'}>{record.lastName}</span>
                            </span>
                            <span className={'db pr3 pb3 w5'}>
                                <span className={'db f6 black'}>Street</span>
                                <span className={'db f5 black b'}>{record.street}</span>
                            </span>
                            <span className={'db pr3 pb3 w5'}>
                                <span className={'db f6 black'}>Building Number</span>
                                <span className={'db f5 black b'}>{record.buildingNumber}</span>
                            </span>
                            <span className={'db pr3 pb3 w5'}>
                                <span className={'db f6 black'}>Area Code</span>
                                <span className={'db f5 black b'}>{record.areaCode}</span>
                            </span>
                            <span className={'db pr3 pb3 w5'}>
                                <span className={'db f6 black'}>City</span>
                                <span className={'db f5 black b'}>{record.city}</span>
                            </span>
                        </div>

                        <div className={'mt3'}>
                            <span className={cx(['f5 b black'])}>Social</span>
                            <span className={styles.ornament} />
                            <div className={'mt2 flex flex-row items-center flex-wrap'}>
                                <span className={'db pr3 pb3 w5'}>
                                    <span className={'db f6 black'}>Twitter</span>
                                    <span className={'db f5 black b'}>
                                        <a href={record.twitterProfileURL} target={'_blank'}>
                                            {record.twitterUsername}
                                        </a>
                                    </span>
                                </span>
                                <span className={'db pr3 pb3 w5'}>
                                    <span className={'db f6 black'}>Facebook</span>
                                    <span className={'db f5 black b'}>
                                        <a href={record.facebookProfileURL} target={'_blank'}>
                                            {record.facebookUsername}
                                        </a>
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className={'mt3'}>
                            <span className={cx(['f5 b black'])}>Contact</span>
                            <span className={styles.ornament} />
                            <div className={'mt2 flex flex-row items-center flex-wrap'}>
                                <span className={'db pr3 pb3 w5'}>
                                    <span className={'db f6 black'}>Phone</span>
                                    <span className={'db f5 black b'}>{record.phoneNumber}</span>
                                </span>
                                <span className={'db pr3 pb3 w5'}>
                                    <span className={'db f6 black'}>E-mail</span>
                                    <span className={'db f5 black b'}>{record.email}</span>
                                </span>
                            </div>
                        </div>

                        <div className={'mt3'}>
                            <span className={cx(['f5 b black'])}>
                                Ambassador of the following companies
                            </span>
                            <span className={styles.ornament} />
                            <div className={'mt2 flex flex-row items-center flex-wrap'}>
                                <div className={'flex flex-row items-center'}>
                                    <Avatar icon="user" />
                                    <div className={'flex flex-column mh2'}>
                                        <span className={'f6 primary'}>Company Name</span>
                                        <span className={'f6 gray'}>Score: 5643</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={'mt3'}>
                            <span className={cx(['f5 b black'])}>Total Score</span>
                            <span className={styles.ornament} />
                            <div className={'mt2 flex flex-row items-center flex-wrap'}>
                                <span className={'db pr3 pb3 w5'}>
                                    <span className={'db f5 black b'}>{record.totalScore}</span>
                                </span>
                            </div>
                        </div>
                    </>
                )
            }}
            dataSource={data}
        />
    )
}

const SettingsAmbassadors: FunctionComponent<ISettingsAmbassadorsProps> = () => {
    return (
        <Tabs
            defaultActiveKey={'1'}
            renderTabBar={props => {
                return (
                    <TabList
                        className={
                            'list ma0 pa0 flex flex-row justify-stretch card mb3 mh1'
                        }
                    >
                        {props['panels'].map(panel => (
                            <Tab
                                key={panel.key}
                                className={cx([
                                    'w-100 bg-white flex items-center justify-center pa3 tc b pointer',
                                    {
                                        'bg-primary white': props['activeKey'] === panel.key,
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
            <TabPane tab="Personal Info" key="1">
                <PersonalInfo />
            </TabPane>
            <TabPane tab="Company Info" key="2">
                <CompanyInfo />
            </TabPane>
            <TabPane tab="Applicants" key="3">
                <Applicants />
            </TabPane>
            <TabPane tab="Companies Looking for Ambassadors" key="4">
                XD
            </TabPane>
        </Tabs>
    )
}

SettingsAmbassadors.defaultProps = {}

export default SettingsAmbassadors
