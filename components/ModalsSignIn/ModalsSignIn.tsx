import React, { FunctionComponent, useCallback } from 'react'

import styles from './ModalsSignIn.module.scss'
import { Button, Checkbox, Modal, Typography } from 'antd'
import { SIGN_IN_OPTIONS } from '@globals'
import { observer } from 'mobx-react'
import { SignInOptions } from '@constants/sign-in-options'
import cx from 'classnames'
import { setCookie } from 'nookies'
import { useStores } from '@stores'

const { Title, Text } = Typography

interface IModalsSignInProps {
    visible: boolean
    handleOk: () => void
    handleCancel: () => void
}

const ModalsSignIn: FunctionComponent<IModalsSignInProps> = ({
    visible,
    handleCancel,
    handleOk,
}) => {
    const { authStore } = useStores()

    const onChange = useCallback(e => {
        console.log(e.target.checked)

        if (!e.target.checked) {
            setCookie(null, 'preferredSignInMethod', SIGN_IN_OPTIONS.none, {
                path: '/',
            })
        } else {
            if (authStore.preferredSignInMethod) {
                setCookie(null, 'preferredSignInMethod', authStore.preferredSignInMethod, {
                    path: '/',
                })
            }
        }
    }, [])

    const handleSignInWithAnotherBK = useCallback(() => {
        console.log('test')
    }, [])

    return (
        <Modal
            width={window.innerWidth / 1.5}
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
                <Checkbox
                    key={'checkbox'}
                    onChange={onChange}
                    disabled={authStore.preferredSignInMethod === SIGN_IN_OPTIONS.none}
                >
                    Automatically select this option next time
                </Checkbox>,
                authStore.preferredSignInMethod === SIGN_IN_OPTIONS.brainKey && (
                    <Button
                        key="signInWithAnotherBK"
                        type="primary"
                        loading={false}
                        onClick={handleSignInWithAnotherBK}
                    >
                        Sign in via another brain key
                    </Button>
                ),
                <Button
                    key="submit"
                    type="primary"
                    loading={false}
                    onClick={handleOk}
                    disabled={authStore.preferredSignInMethod === SIGN_IN_OPTIONS.none}
                >
                    Select a sign in method
                </Button>,
            ]}
        >
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
                                'db br4 pointer dim',
                                {
                                    'ba bw3 b--black-10':
                                        authStore.preferredSignInMethod === option.name,
                                },
                            ])}
                        >
                            <img src={option.icon} alt={`Toggle ${option.name} sign in`} />
                        </span>
                    ))}
                </div>
            </div>
        </Modal>
    )
}

ModalsSignIn.defaultProps = {}

export default observer(ModalsSignIn)
