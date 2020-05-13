import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'

import styles from './SettingsAmbassadors.module.scss'
import cx from 'classnames'
import {
    Avatar,
    Button,
    Dropdown,
    Form,
    Icon,
    Input,
    Menu,
    Spin,
    Switch,
    Table,
    Tabs,
    Tag,
} from 'antd'
import { Tab, TabList } from 'react-tabs'
import { Observer, useObserver } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import { IAmbassadorResponse } from '@novuspherejs/nsdb'
import { getIdenticon } from '@utils'
import { UserNameWithIcon } from '../index'
import _ from 'lodash'
import { MODAL_OPTIONS } from '@globals'

const { TabPane } = Tabs

interface ISettingsAmbassadorsProps {}

const SaveButton = ({ onSave, loading = false, title = 'Save', children = null }) => {
    return useObserver(() => (
        <div className={'pt3 flex flex-row justify-end w-100'}>
            {children}
            <Button type={'primary'} onMouseDown={onSave} loading={loading}>
                {title}
            </Button>
        </div>
    ))
}

const Ambassador = ({
    icon = '',
    companyName,
    score,
    pub,
    approved = false,
    onDelete = (pub: string) => null,
}) => {
    const menu = (
        <Menu>
            <Menu.Item key="1" onMouseDown={() => onDelete(pub)}>
                <Icon type="delete" />
                Delete
            </Menu.Item>
        </Menu>
    )

    return (
        <Dropdown overlay={menu}>
            <div className={'pointer ba b--light-gray br3 pa2 flex flex-row items-center'}>
                <Avatar icon={'user'} src={icon} />
                <div className={'flex flex-column mh2'}>
                    <span className={'f6 primary'}>{companyName || '--'}</span>
                    <span className={'f6 gray'}>Score: {score || '--'}</span>
                    <span className={'pv1'}>
                        {approved ? (
                            <Tag color="green">Approved</Tag>
                        ) : (
                            <Tag color="volcano">Pending Approval</Tag>
                        )}
                    </span>
                </div>
            </div>
        </Dropdown>
    )
}

const PersonalInfo = Form.create({ name: 'personal_info' })(({ form }: any) => {
    const { getFieldDecorator } = form
    const { userStore }: RootStore = useStores()
    const [loading, setLoading] = useState(true)
    const [myCompanies, setMyCompanies] = useState({ companies: [] })
    const onSave = () => {
        form.validateFields(async (err, values) => {
            if (!err) {
                userStore.ambassador.personalInfo = values
                userStore.saveAmbassadors()
            }
        })
    }

    useEffect(() => {
        userStore.getMyCompaniesForAmbassadors().then(data => {
            setMyCompanies(data)
            setLoading(false)
        })
    }, [userStore.ambassadorTabActiveKey])

    const handleDelete = useCallback(
        (pub: string) => {
            setMyCompanies({
                companies: _.reject(myCompanies.companies, company => company.pub === pub),
            })
            userStore.deleteCompanyFromMyAmbassador(pub)
        },
        [myCompanies]
    )

    return useObserver(() => (
        <>
            <Form.Item label="Name">
                {getFieldDecorator('username', {
                    initialValue: userStore.ambassador.personalInfo.username,
                    rules: [
                        {
                            required: true,
                            message: 'Please input your username',
                        },
                    ],
                })(<Input size={'large'} />)}
            </Form.Item>
            <Form.Item label="Email">
                {getFieldDecorator('email', {
                    initialValue: userStore.ambassador.personalInfo.email,
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
                <Observer>
                    {() =>
                        loading ? (
                            <Spin />
                        ) : (
                            <div className={'flex flex-row flex-wrap items-center'}>
                                {myCompanies.companies.length ? (
                                    myCompanies.companies.map(company => (
                                        <Ambassador
                                            key={company.pub}
                                            icon={getIdenticon(company.pub)}
                                            companyName={company.companyName}
                                            pub={company.pub}
                                            score={'--'}
                                            approved={company.approved}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                ) : (
                                    <span className={'f6 gray'}>You have no applications.</span>
                                )}
                            </div>
                        )
                    }
                </Observer>
            </div>

            <SaveButton
                onSave={onSave}
                title={'Save Personal Info'}
                loading={userStore.saveAmbassadors.bind(userStore)['pending']}
            />
        </>
    ))
})

const CompanyInfo = Form.create({ name: 'company_info' })(({ form }: any) => {
    const { getFieldDecorator } = form
    const { userStore, uiStore }: RootStore = useStores()
    const onSave = () => {
        form.validateFields(async (err, values) => {
            if (!err) {
                userStore.ambassador.companyInfo = values
                userStore.saveAmbassadors()
            }
        })
    }
    return useObserver(() => (
        <>
            <Form.Item label="Company Name">
                {getFieldDecorator('companyName', {
                    initialValue: userStore.ambassador.companyInfo.companyName,
                    rules: [
                        {
                            required: true,
                            message: 'Please enter a company name',
                        },
                    ],
                })(<Input size={'large'} />)}
            </Form.Item>
            <Form.Item label="Owner's first name">
                {getFieldDecorator('firstName', {
                    initialValue: userStore.ambassador.companyInfo.firstName,
                    rules: [
                        {
                            required: true,
                            message: 'Please enter a first name',
                        },
                    ],
                })(<Input size={'large'} />)}
            </Form.Item>
            <Form.Item label="Owner's last name">
                {getFieldDecorator('lastName', {
                    initialValue: userStore.ambassador.companyInfo.lastName,
                    rules: [
                        {
                            required: true,
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
                        initialValue: userStore.ambassador.companyInfo.street,
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
                        initialValue: userStore.ambassador.companyInfo.buildingNumber,
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
                        initialValue: userStore.ambassador.companyInfo.areaCode,
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
                        initialValue: userStore.ambassador.companyInfo.city,
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
                                initialValue: userStore.ambassador.companyInfo.twitterUsername,
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
                                initialValue: userStore.ambassador.companyInfo.twitterProfileURL,
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
                                initialValue: userStore.ambassador.companyInfo.facebookUsername,
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
                                initialValue: userStore.ambassador.companyInfo.facebookProfileURL,
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
                    {getFieldDecorator('phoneNumber', {
                        initialValue: userStore.ambassador.companyInfo.phoneNumber,
                        rules: [
                            {
                                required: true,
                                message: 'Please enter a valid phone number',
                            },
                        ],
                    })(<Input size={'large'} />)}
                </Form.Item>
                <Form.Item label="Email">
                    {getFieldDecorator('email', {
                        initialValue: userStore.ambassador.companyInfo.email,
                        rules: [
                            {
                                required: true,
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
                <Form.Item>
                    {getFieldDecorator('available', {
                        initialValue: userStore.ambassador.companyInfo.available,
                        valuePropName: 'checked',
                    })(<Switch />)}
                </Form.Item>
            </div>

            <SaveButton
                onSave={onSave}
                title={'Save Company Info'}
                loading={userStore.saveAmbassadors.bind(userStore)['pending']}
            >
                <Button
                    type="danger"
                    className={'mr2'}
                    onClick={() => uiStore.setActiveModal(MODAL_OPTIONS.createNewCampaign)}
                >
                    Create Campaign
                </Button>
            </SaveButton>
        </>
    ))
})

const Applicants = () => {
    const { userStore }: RootStore = useStores()
    const [data, setData] = useState<any>({ applicants: [] })
    const columns = [
        { title: '#', dataIndex: 'key', key: 'key', render: (text, record, index) => index + 1 },
        {
            title: 'Applicants Username',
            dataIndex: 'displayName',
            key: 'displayName',
            render: (text, record) => (
                <div className={'flex flex-row items-center'}>
                    <UserNameWithIcon
                        imageData={getIdenticon(record.postPub)}
                        pub={record.pub}
                        name={text}
                    />
                </div>
            ),
        },
        {
            title: 'Status',
            render: (text, record) => (
                <Observer>
                    {() =>
                        userStore.ambassador.acceptedAmbassadors.indexOf(record.pub) !== -1 ? (
                            <Tag color="green">Approved</Tag>
                        ) : (
                            <Tag color="volcano">Pending Approval</Tag>
                        )
                    }
                </Observer>
            ),
        },
        {
            key: 'action',
            render: (text, record) => (
                <Observer>
                    {() => (
                        <Button
                            disabled={
                                userStore.ambassador.acceptedAmbassadors.indexOf(record.pub) !== -1
                            }
                            loading={userStore.toggleApproveApplicant['pending']}
                            onMouseDown={() => userStore.toggleApproveApplicant(record.pub)}
                        >
                            Approve
                        </Button>
                    )}
                </Observer>
            ),
        },
    ]

    useEffect(() => {
        userStore.getApplicantsForAmbassadors().then(result => {
            setData(result)
        })
    }, [userStore.ambassadorTabActiveKey])

    if (userStore.getApplicantsForAmbassadors['pending']) {
        return <Spin />
    }

    return <Table columns={columns} dataSource={data.applicants} />
}

const CompaniesLookingForAmbassadors = () => {
    const { userStore }: RootStore = useStores()
    const [data, setData] = useState<IAmbassadorResponse>({ companies: [] })
    const columns = [
        { title: '#', dataIndex: 'key', key: 'key', render: (text, record, index) => index + 1 },
        {
            title: "Ambassador's Company Name",
            dataIndex: 'companyName',
            key: 'companyName',
            render: (text, record) => (
                <span className={'flex flex-row items-center'}>
                    <Avatar icon={'user'} src={getIdenticon(record.pub)} />
                    <span className={'primary f6 ph2'}>{text}</span>
                </span>
            ),
        },
        {
            key: 'action',
            render: (text, record) => (
                <Observer>
                    {() => (
                        <Button
                            loading={userStore.toggleApplyUserToCompany['pending']}
                            onMouseDown={() => userStore.toggleApplyUserToCompany(record.pub)}
                        >
                            {userStore.ambassador &&
                            userStore.ambassador.joinedCompanies.indexOf(record.pub) !== -1
                                ? 'Unapply'
                                : 'Apply'}
                        </Button>
                    )}
                </Observer>
            ),
        },
    ]

    useEffect(() => {
        userStore.getCompaniesLookingForAmbassadors().then(result => setData(result))
    }, [userStore.ambassadorTabActiveKey])

    if (userStore.getCompaniesLookingForAmbassadors['pending']) {
        return <Spin />
    }

    return (
        <Table
            columns={columns}
            rowKey={'pub'}
            expandedRowRender={record => {
                return (
                    <>
                        <div className={'flex flex-row items-center flex-wrap'}>
                            <span className={'db pr3 pb3 w5'}>
                                <span className={'db f6 black gray'}>Ambassador's First Name</span>
                                <span className={'db f5 black'}>{record.firstName || '--'}</span>
                            </span>
                            <span className={'db pr3 pb3 w5'}>
                                <span className={'db f6 black gray'}>Ambassador's Last Name</span>
                                <span className={'db f5 black'}>{record.lastName || '--'}</span>
                            </span>
                            <span className={'db pr3 pb3 w5'}>
                                <span className={'db f6 black gray'}>Street</span>
                                <span className={'db f5 black'}>{record.street || '--'}</span>
                            </span>
                            <span className={'db pr3 pb3 w5'}>
                                <span className={'db f6 black gray'}>Building Number</span>
                                <span className={'db f5 black'}>
                                    {record.buildingNumber || '--'}
                                </span>
                            </span>
                            <span className={'db pr3 pb3 w5'}>
                                <span className={'db f6 black gray'}>Area Code</span>
                                <span className={'db f5 black'}>{record.areaCode || '--'}</span>
                            </span>
                            <span className={'db pr3 pb3 w5'}>
                                <span className={'db f6 black gray'}>City</span>
                                <span className={'db f5 black'}>{record.city || '--'}</span>
                            </span>
                        </div>

                        <div className={'mt3'}>
                            <span className={cx(['f5 b black'])}>Social</span>
                            <span className={styles.ornament} />
                            <div className={'mt2 flex flex-row items-center flex-wrap'}>
                                <span className={'db pr3 pb3 w5'}>
                                    <span className={'db f6 black gray'}>Twitter</span>
                                    <span className={'db f5 black'}>
                                        <a href={record.twitterProfileURL} target={'_blank'}>
                                            {record.twitterUsername || '--'}
                                        </a>
                                    </span>
                                </span>
                                <span className={'db pr3 pb3 w5'}>
                                    <span className={'db f6 black gray'}>Facebook</span>
                                    <span className={'db f5 black'}>
                                        <a href={record.facebookProfileURL} target={'_blank'}>
                                            {record.facebookUsername || '--'}
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
                                    <span className={'db f6 black gray'}>Phone</span>
                                    <span className={'db f5 black'}>
                                        {record.phoneNumber || '--'}
                                    </span>
                                </span>
                                <span className={'db pr3 pb3 w5'}>
                                    <span className={'db f6 black gray'}>E-mail</span>
                                    <span className={'db f5 black'}>{record.email || '--'}</span>
                                </span>
                            </div>
                        </div>
                    </>
                )
            }}
            dataSource={data.companies}
        />
    )
}

const SettingsAmbassadors: FunctionComponent<ISettingsAmbassadorsProps> = () => {
    const { userStore, authStore }: RootStore = useStores()

    if (!authStore.hasAccount) {
        return <span className={'f6 gray'}>Please sign in to view this option</span>
    }

    const onChange = key => (userStore.ambassadorTabActiveKey = key)

    const renderTabBar = useCallback(props => {
        return (
            <TabList className={'list ma0 pa0 flex flex-row justify-stretch card mb3 mh1'}>
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
    }, [])

    return (
        <>
            <Tabs
                defaultActiveKey="1"
                onChange={onChange}
                renderTabBar={(props, DefaultTabBar) => (
                    <DefaultTabBar {...props} className={styles.customTab} />
                )}
            >
                <TabPane tab="Become Ambassador" key="1">
                    <Tabs
                        onChange={onChange}
                        defaultActiveKey={userStore.ambassadorTabActiveKey}
                        destroyInactiveTabPane={true}
                        renderTabBar={renderTabBar}
                    >
                        <TabPane tab="Your Info" key="2">
                            <PersonalInfo />
                        </TabPane>
                        <TabPane tab="Companies" key="3">
                            <CompanyInfo />
                        </TabPane>
                    </Tabs>
                </TabPane>
                <TabPane tab="Rally Ambassadors" key="4">
                    <Tabs
                        onChange={onChange}
                        defaultActiveKey={userStore.ambassadorTabActiveKey}
                        destroyInactiveTabPane={true}
                        renderTabBar={renderTabBar}
                    >
                        <TabPane tab="Applicants" key="5">
                            <Applicants />
                        </TabPane>
                        <TabPane tab="Companies Looking for Ambassadors" key="6">
                            <CompaniesLookingForAmbassadors />
                        </TabPane>
                    </Tabs>
                </TabPane>
            </Tabs>
        </>
    )
}

SettingsAmbassadors.defaultProps = {}

export default SettingsAmbassadors
