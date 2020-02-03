import React, { FunctionComponent, useCallback, useContext, useState } from 'react'

import styles from './ModalsSignIn.module.scss'
import {
    Button,
    Checkbox,
    Modal,
    Typography,
    Result,
    Icon,
    Form,
    Input,
    Select,
    notification,
} from 'antd'
import { SIGN_IN_OPTIONS } from '@globals'
import { observer } from 'mobx-react'
import { SignInOptions } from '@constants/sign-in-options'
import cx from 'classnames'
import { setCookie, parseCookies } from 'nookies'
import { RootStore, StoreContext } from '@stores'
import { hasErrors } from '@utils'

const { Title, Text } = Typography

interface IModalsSignInProps {
    visible: boolean
    handleOk: () => void
    handleCancel: () => void

    form: any
}

enum STEP_OPTIONS {
    METHOD,
    SIGN_IN_WITH_ANOTHER_BK,
    SIGN_IN_WITH_CURRENT_BK,
}

const { TextArea } = Input

const ModalsSignIn: FunctionComponent<IModalsSignInProps> = ({
    visible,
    handleCancel,
    handleOk,
    form,
}) => {
    const { authStore, uiStore }: RootStore = useContext(StoreContext)
    const cookies = parseCookies(window)
    const [remember, setRemember] = useState(
        cookies['preferredSignInMethod'] === SIGN_IN_OPTIONS.brainKey
    )
    const [step, setStep] = useState<STEP_OPTIONS>(STEP_OPTIONS.SIGN_IN_WITH_ANOTHER_BK)

    const onChange = useCallback(e => {
        if (!e.target.checked) {
            setCookie(window, 'preferredSignInMethod', SIGN_IN_OPTIONS.none, {
                path: '/',
            })

            setRemember(false)
        } else {
            if (authStore.preferredSignInMethod) {
                setCookie(window, 'preferredSignInMethod', authStore.preferredSignInMethod, {
                    path: '/',
                })
            }
            setRemember(true)
        }
    }, [])

    const next = useCallback(() => {
        setStep(prevState => prevState + 1)
    }, [])

    const back = useCallback(() => {
        setStep(prevState => prevState - 1)
    }, [])

    const footer = useCallback(() => {
        switch (step) {
            case STEP_OPTIONS.METHOD:
                return [
                    <Checkbox
                        key={'checkbox'}
                        onChange={onChange}
                        checked={remember}
                        disabled={authStore.preferredSignInMethod === SIGN_IN_OPTIONS.none}
                    >
                        Automatically select this option next time
                    </Checkbox>,
                    authStore.preferredSignInMethod === SIGN_IN_OPTIONS.brainKey && (
                        <Button
                            key="signInWithAnotherBK"
                            type="primary"
                            loading={false}
                            onClick={next}
                        >
                            Sign in via another brain key
                        </Button>
                    ),
                    !authStore.preferredSignInMethod && (
                        <Button
                            key="submit"
                            type="primary"
                            loading={false}
                            onClick={handleOk}
                            disabled={authStore.preferredSignInMethod === SIGN_IN_OPTIONS.none}
                        >
                            Select a sign in method
                        </Button>
                    ),
                ]
            case STEP_OPTIONS.SIGN_IN_WITH_ANOTHER_BK:
                return [
                    <Button key="prev" onClick={back}>
                        Go Back
                    </Button>,
                    <Button
                        key="submit"
                        type="danger"
                        onClick={handleSubmit}
                        disabled={hasErrors(form.getFieldsError())}
                    >
                        Setup and login with new account
                    </Button>,
                ]
        }
    }, [step])

    const handleSubmit = useCallback(e => {
        e.preventDefault()
        form.validateFields(async (err, values) => {
            if (!err) {
                const { brainKey, displayName, password } = values

                try {
                    await authStore.signInWithBK(brainKey, displayName, password)
                    notification.success({
                        message: 'You have successfully signed in!',
                    })
                    uiStore.clearActiveModal()
                } catch (error) {
                    if (error.message === 'You have entered an invalid brain key') {
                        form.setFields({
                            brainKey: {
                                value: brainKey,
                                errors: [new Error(error.message)],
                            },
                        })
                    } else {
                        notification.error({
                            message: 'Failed to sign in!',
                            description: error.message,
                        })
                    }

                    return error
                }
            }
        })
    }, [])

    const handleSelectChange = useCallback(value => {
        console.log(value)
        form.setFieldsValue({
            note: `Hi, ${value === 'male' ? 'man' : 'lady'}!`,
        })
    }, [])

    const content = useCallback(() => {
        switch (step) {
            case STEP_OPTIONS.METHOD:
                return (
                    <div className={'tc pt2'}>
                        <Title level={2}>Sign in with your EOS account</Title>
                        <Text className={'light-content'}>
                            Choose an account type from below to continue
                        </Text>

                        <div className={styles.accountTypeContainer}>
                            {SignInOptions.map(option => (
                                <span
                                    onClick={() => authStore.setPreferredSignInMethod(option.name)}
                                    key={option.name}
                                    title={`Toggle ${option.name} sign in`}
                                    className={cx([
                                        'dt center br4 pointer dim',
                                        {
                                            'ba bw1 b--primary':
                                                authStore.preferredSignInMethod === option.name,
                                        },
                                    ])}
                                >
                                    <img
                                        src={option.icon}
                                        alt={`Toggle ${option.name} sign in`}
                                        className={'br4'}
                                    />
                                </span>
                            ))}
                        </div>
                    </div>
                )
            case STEP_OPTIONS.SIGN_IN_WITH_ANOTHER_BK:
                const { getFieldDecorator } = form

                return (
                    <>
                        <Result
                            icon={<Icon type="lock" theme="twoTone" twoToneColor={'#09c3bd'} />}
                            title={'Enter your BK and Password'}
                            subTitle={
                                <span>
                                    Enter your brain key, display name and password.
                                    <br />
                                    Once successful, we will use this account by default the next
                                    time you click "Sign in with BK".
                                </span>
                            }
                        />
                        <Form
                            labelCol={{ span: 7 }}
                            wrapperCol={{ span: 12 }}
                            onSubmit={handleSubmit}
                            className={'center'}
                        >
                            <Form.Item label="Brain Key">
                                {getFieldDecorator('brainKey', {
                                    rules: [
                                        { required: true, message: 'Please enter your brain key.' },
                                    ],
                                })(<TextArea rows={4} />)}
                            </Form.Item>
                            <Form.Item label="Display Name">
                                {getFieldDecorator('displayName', {
                                    rules: [
                                        { required: true, message: 'Please enter a displayname.' },
                                    ],
                                })(<Input placeholder={'Enter your preferred displayname'} />)}
                            </Form.Item>
                            <Form.Item label="Password">
                                {getFieldDecorator('password', {
                                    rules: [
                                        { required: true, message: 'Please enter your password.' },
                                    ],
                                })(
                                    <Input
                                        placeholder={
                                            'Enter the password you want to use to encrypt this key.'
                                        }
                                        type={'password'}
                                    />
                                )}
                            </Form.Item>
                        </Form>
                    </>
                )
        }
    }, [step])

    return (
        <Modal
            width={window.innerWidth / 1.5}
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={footer()}
        >
            {content()}
        </Modal>
    )
}

ModalsSignIn.defaultProps = {}

const Wrapped = Form.create({ name: 'coordinated' })(ModalsSignIn)

export default observer(Wrapped) as any
