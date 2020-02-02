import React, { FunctionComponent, useCallback, useContext } from 'react'

import styles from './ModalsSignIn.module.scss'
import { Button, Checkbox, Modal, Typography } from 'antd'
import { SIGN_IN_OPTIONS } from '@globals'
import { observer } from 'mobx-react'
import { RootStoreContext } from '@stores'
import { SignInOptions } from '@constants/sign-in-options'
import cx from 'classnames'
import { setCookie } from 'nookies'

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
    const store = useContext(RootStoreContext)
    const onChange = useCallback(e => {
        console.log(e.target.checked)

        if (!e.target.checked) {
            setCookie(null, 'preferredSignInMethod', SIGN_IN_OPTIONS.none, {
                path: '/',
            })
        } else {
            if (store.authStore.preferredSignInMethod) {
                setCookie(null, 'preferredSignInMethod', store.authStore.preferredSignInMethod, {
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
                    disabled={store.authStore.preferredSignInMethod === SIGN_IN_OPTIONS.none}
                >
                    Automatically select this option next time
                </Checkbox>,
                store.authStore.preferredSignInMethod === SIGN_IN_OPTIONS.brainKey && (
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
                    disabled={store.authStore.preferredSignInMethod === SIGN_IN_OPTIONS.none}
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
                            onClick={() => store.authStore.setPreferredSignInMethod(option.name)}
                            key={option.name}
                            title={`Toggle ${option.name} sign in`}
                            className={cx([
                                'db br4 pointer dim',
                                {
                                    'ba bw3 b--black-10':
                                        store.authStore.preferredSignInMethod === option.name,
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
