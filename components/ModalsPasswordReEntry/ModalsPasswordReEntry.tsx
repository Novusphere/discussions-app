import React, { FunctionComponent, useCallback } from 'react'

import styles from './ModalsPasswordReEntry.module.scss'
import { observer } from 'mobx-react'
import { Button, Form, Icon, Input, Modal, Result, Table, Typography } from 'antd'
import { getIdenticon, hasErrors } from '@utils'
import { RootStore, useStores } from '@stores'
import { discussions } from '@novuspherejs'
import _ from 'lodash'
import { UserNameWithIcon } from '../index'

const { Paragraph } = Typography

interface IModalsPasswordReEntryProps {
    visible: boolean
    handleOk: () => void
    handleCancel: () => void
    form: any
}

const ModalsPasswordReEntry: FunctionComponent<IModalsPasswordReEntryProps> = ({
    visible,
    handleCancel,
    handleOk,
    form,
}) => {
    const { authStore, walletStore }: RootStore = useStores()

    const footer = useCallback(() => {
        return [
            <Button
                key="signInWithAnotherBK"
                type={'danger'}
                loading={false}
                onClick={handlePasswordSubmit}
                disabled={hasErrors(form.getFieldsError())}
            >
                Continue with transaction
            </Button>,
        ]
    }, [])

    const handlePasswordSubmit = useCallback(e => {
        e.preventDefault()
        form.validateFields(async (err, values) => {
            if (!err) {
                const { passwordRentry } = values

                try {
                    const { bk: cookieBk } = authStore

                    if (typeof cookieBk === 'undefined') {
                        throw new Error('No BK found')
                    }

                    const { bk, bkc } = JSON.parse(cookieBk)
                    const walletPrivateKey = await discussions.encryptedBKToKeys(
                        bk,
                        bkc,
                        passwordRentry
                    )

                    authStore.setTEMPPrivateKey(walletPrivateKey)
                } catch (error) {
                    form.setFields({
                        passwordRentry: {
                            value: passwordRentry,
                            errors: [new Error(error.message)],
                        },
                    })
                    return error
                }
            }
        })
    }, [])

    const { getFieldDecorator } = form

    return (
        <Modal
            width={window.innerWidth / 1.5}
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={footer()}
        >
            <>
                <Result
                    icon={<Icon type="unlock" theme="twoTone" twoToneColor={'#FF4136'} />}
                    title={'Enter your password'}
                    subTitle={
                        <span>
                            Enter your password to decrypt your key and continue with this
                            transaction.
                        </span>
                    }
                />

                {authStore.TEMP_TippingTransfers.length > 1 && (
                    <>
                        <Table
                            pagination={false}
                            dataSource={authStore.TEMP_TippingTransfers}
                            columns={[
                                {
                                    title: 'Amount',
                                    dataIndex: 'amount',
                                    key: 'amount',
                                    render: (text, record) => {
                                        const [amount] = text.split(' ')
                                        const [fee] = record.fee.split(' ')
                                        const [img, precision] = walletStore.supportedTokensImages[
                                            record.symbol
                                        ]

                                        return (
                                            <div className={'flex flex-row items-center'}>
                                                <img
                                                    src={img}
                                                    alt={`${record.symbol} image`}
                                                    width={20}
                                                    className={'mr1'}
                                                />
                                                {`${Number(Number(amount) + Number(fee)).toFixed(
                                                    precision
                                                )} ${record.token.label}`}
                                            </div>
                                        )
                                    },
                                },
                                {
                                    title: 'Key',
                                    dataIndex: 'to',
                                    key: 'to',
                                    render: text => (
                                        <Paragraph
                                            ellipsis
                                            copyable
                                            className={'w4'}
                                            style={{ margin: 0, padding: 0 }}
                                        >
                                            {text}
                                        </Paragraph>
                                    ),
                                },
                                {
                                    title: 'User',
                                    dataIndex: 'username',
                                    key: 'username',
                                    render: (text, record) => (
                                        <div className={'flex flex-row items-center'}>
                                            <UserNameWithIcon
                                                imageData={getIdenticon(record.postPub)}
                                                pub={record.postPub}
                                                name={text}
                                            />
                                        </div>
                                    ),
                                },
                            ]}
                        />

                        <Table
                            pagination={false}
                            className={'pb3'}
                            dataSource={_.map(
                                _.groupBy(authStore.TEMP_TippingTransfers, 'symbol'),
                                (objs, key) => ({
                                    symbol: key,
                                    amount: _.sumBy(objs, key => {
                                        return (
                                            Number(key.amount.split(' ')[0]) +
                                            Number(key.fee.split(' ')[0])
                                        )
                                    }),
                                })
                            )}
                            columns={[
                                {
                                    title: 'Symbol',
                                    dataIndex: 'symbol',
                                    key: 'symbol',
                                    render: text => `Total ${text}`,
                                },
                                {
                                    title: 'Amount',
                                    dataIndex: 'amount',
                                    key: 'amount',
                                    render: (text, record) => {
                                        const [img, precision] = walletStore.supportedTokensImages[
                                            record.symbol
                                        ]

                                        return (
                                            <div className={'flex flex-row items-center'}>
                                                <img
                                                    src={img}
                                                    alt={`${record.symbol} image`}
                                                    width={20}
                                                    className={'mr1'}
                                                />
                                                {`${Number(text).toFixed(precision)} ${
                                                    record.symbol
                                                }`}
                                            </div>
                                        )
                                    },
                                },
                            ]}
                        />
                    </>
                )}

                <Form
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 12 }}
                    onSubmit={handlePasswordSubmit}
                    className={'center'}
                >
                    <Form.Item label="Password">
                        {getFieldDecorator('passwordRentry', {
                            rules: [{ required: true, message: 'Please enter your password.' }],
                        })(
                            <Input
                                placeholder={'Enter the password you used to encrypt your keys'}
                                type={'password'}
                            />
                        )}
                    </Form.Item>
                </Form>
            </>
        </Modal>
    )
}

ModalsPasswordReEntry.defaultProps = {}

const Wrapped = Form.create({ name: 'coordinated' })(ModalsPasswordReEntry)

export default observer(Wrapped) as any
