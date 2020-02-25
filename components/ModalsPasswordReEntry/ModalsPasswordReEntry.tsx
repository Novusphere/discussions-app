import React, { FunctionComponent, useCallback } from 'react'

import styles from './ModalsPasswordReEntry.module.scss'
import { observer } from 'mobx-react'
import { Button, Form, Icon, Input, Modal, Result } from 'antd'
import { hasErrors } from '@utils'
import { RootStore, useStores } from '@stores'
import { discussions } from '@novuspherejs'

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
    const { authStore }: RootStore = useStores()

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

                // try {
                //     await authStore.signInWithPassword(passwordRentry)
                //     notification.success({
                //         message: 'You have successfully signed in!',
                //     })
                //     uiStore.clearActiveModal()
                // } catch (error) {
                //     if (error.message === 'Incorrect brian key pasword') {
                //         form.setFields({
                //             passwordRentry: {
                //                 value: passwordRentry,
                //                 errors: [new Error(error.message)],
                //             },
                //         })
                //     } else {
                //         notification.error({
                //             message: 'Failed to sign in!',
                //             description: error.message,
                //         })
                //     }
                //
                //     return error
                // }
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
