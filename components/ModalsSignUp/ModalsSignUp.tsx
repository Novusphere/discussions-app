import React, { FunctionComponent, useCallback, useState } from 'react'

import styles from './ModalsSignUp.module.scss'
import { Button, Form, Input, Modal, notification } from 'antd'
import { observer } from 'mobx-react'
import { Collapse } from 'antd'
import { RootStore, useStores } from '@stores'
import cx from 'classnames'
import { bkToStatusJson, sleep } from '@utils'
import { discussions } from '@novuspherejs'

const { Panel } = Collapse

interface IModalsSignUpProps {
    visible: boolean
    handleOk: () => void
    handleCancel: () => void

    form: any
}

const { TextArea } = Input

enum STEP_OPTIONS {
    'SETUP_ACCOUNT_NAME_AND_PASSWORD' = 1,
    'GENERATE_BRAIN_KEY',
    'CONFIRM_BRAIN_KEY',
}

const PanelHeader = ({ title, step, currentStep }) => {
    return (
        <>
            <span
                className={cx([
                    'f5',
                    {
                        'dark-gray': step === currentStep,
                        'moon-gray': step !== currentStep,
                    },
                ])}
            >
                {title}
            </span>
            <span className={styles.ornament} />
        </>
    )
}

const Content: React.FC<any> = ({ step, currentForm }) => {
    return (
        <Collapse
            accordion
            bordered={false}
            activeKey={step}
            defaultActiveKey={STEP_OPTIONS.SETUP_ACCOUNT_NAME_AND_PASSWORD}
        >
            <Panel
                disabled
                className={styles.panel}
                header={
                    <PanelHeader
                        currentStep={step}
                        step={STEP_OPTIONS.SETUP_ACCOUNT_NAME_AND_PASSWORD}
                        title={'1. Setup an account name and password'}
                    />
                }
                key={STEP_OPTIONS.SETUP_ACCOUNT_NAME_AND_PASSWORD}
                showArrow={false}
            >
                {currentForm()}
            </Panel>
            <Panel
                disabled
                className={styles.panel}
                header={
                    <PanelHeader
                        currentStep={step}
                        step={STEP_OPTIONS.GENERATE_BRAIN_KEY}
                        title={'2. Generate a brain key'}
                    />
                }
                key={STEP_OPTIONS.GENERATE_BRAIN_KEY}
                showArrow={false}
            >
                {currentForm()}
            </Panel>
            <Panel
                disabled
                className={styles.panel}
                header={
                    <PanelHeader
                        currentStep={step}
                        step={STEP_OPTIONS.CONFIRM_BRAIN_KEY}
                        title={'3. Verify your brain key'}
                    />
                }
                key={STEP_OPTIONS.CONFIRM_BRAIN_KEY}
                showArrow={false}
            >
                {currentForm()}
            </Panel>
        </Collapse>
    )
}

const Footer: React.FC<any> = ({ step, next, back, handleContinueClick, createAccountLoading }) => {
    switch (step) {
        default:
            return null
        case STEP_OPTIONS.SETUP_ACCOUNT_NAME_AND_PASSWORD:
            return (
                <Button type={'primary'} onClick={handleContinueClick}>
                    Go to next step
                </Button>
            )
        case STEP_OPTIONS.GENERATE_BRAIN_KEY:
            return (
                <>
                    <Button onClick={back}>Back</Button>
                    <Button type={'primary'} onClick={handleContinueClick}>
                        Confirm my key
                    </Button>
                </>
            )
        case STEP_OPTIONS.CONFIRM_BRAIN_KEY:
            return (
                <>
                    <Button disabled={createAccountLoading} onClick={back}>
                        Back
                    </Button>
                    <Button
                        loading={createAccountLoading}
                        type={'danger'}
                        onClick={handleContinueClick}
                    >
                        Complete Sign Up
                    </Button>
                </>
            )
    }
}

const ModalsSignUp: FunctionComponent<IModalsSignUpProps> = ({
    visible,
    handleCancel,
    handleOk,
    form,
}) => {
    const { authStore, uiStore, userStore }: RootStore = useStores()
    const { getFieldDecorator } = form
    const [currentStep, setStep] = useState(STEP_OPTIONS.SETUP_ACCOUNT_NAME_AND_PASSWORD)
    const next = useCallback(() => {
        setStep(currentStep + 1)
    }, [currentStep])
    const back = useCallback(() => {
        setStep(currentStep - 1)
    }, [currentStep])
    const [createAccountLoading, setCreateAccountLoadingStatus] = useState(false)

    const handleContinueClick = useCallback(
        e => {
            e.preventDefault()

            switch (currentStep) {
                case STEP_OPTIONS.SETUP_ACCOUNT_NAME_AND_PASSWORD:
                    form.validateFields(async (err, values) => {
                        if (!err) {
                            const { displayName, password, confirmPassword } = values

                            const match = displayName.match(/^[\d]*[a-z_][a-z\d_]*$/i)

                            if (!match) {
                                return form.setFields({
                                    displayName: {
                                        value: displayName,
                                        errors: [
                                            new Error(
                                                'Your display name can only be letters, numbers or underscores.'
                                            ),
                                        ],
                                    },
                                })
                            }

                            if (confirmPassword !== password) {
                                return form.setFields({
                                    confirmPassword: {
                                        value: confirmPassword,
                                        errors: [
                                            new Error(
                                                'The password you have entered does not match, please try again.'
                                            ),
                                        ],
                                    },
                                })
                            }

                            setInitialValues(prev => ({
                                ...prev,
                                displayName,
                                password,
                                confirmPassword,
                            }))

                            next()
                        }
                    })

                    break
                case STEP_OPTIONS.GENERATE_BRAIN_KEY:
                    console.log(initialValues.brainKeyGenerated)
                    next()
                    break
                case STEP_OPTIONS.CONFIRM_BRAIN_KEY:
                    form.validateFields(async (err, values) => {
                        if (!err) {
                            const { brainKeyConfirm } = values

                            if (
                                brainKeyConfirm &&
                                brainKeyConfirm !== initialValues.brainKeyGenerated
                            ) {
                                return form.setFields({
                                    brainKeyConfirm: {
                                        value: brainKeyConfirm,
                                        errors: [
                                            new Error(
                                                'The brain key you entered does not match the one we created, please try again.'
                                            ),
                                        ],
                                    },
                                })
                            }

                            const {
                                displayName,
                                password,
                                confirmPassword,
                                brainKeyGenerated,
                            } = initialValues

                            try {
                                setCreateAccountLoadingStatus(true)
                                const json = await bkToStatusJson(
                                    brainKeyGenerated,
                                    displayName,
                                    password,
                                    null
                                )
                                console.log('created json: ', json)
                                const transaction = await discussions.bkUpdateStatusEOS(json)
                                console.log('signed up!: ', transaction)
                                await authStore.signInWithBK(
                                    brainKeyGenerated,
                                    displayName,
                                    password
                                )
                                userStore.resetUserStore()
                                await sleep(1500)
                                setCreateAccountLoadingStatus(false)
                                uiStore.clearActiveModal()
                                uiStore.showToast(
                                    'Success',
                                    `Welcome to Discussions.App ${displayName}!`,
                                    'success'
                                )
                            } catch (error) {
                                form.setFields({
                                    brainKeyConfirm: {
                                        value: brainKeyConfirm,
                                        errors: [new Error(error.message)],
                                    },
                                })
                                setCreateAccountLoadingStatus(false)
                            }

                            // next()
                        }
                    })
                    break
            }
        },
        [currentStep]
    )

    const [initialValues, setInitialValues] = useState({
        displayName: '',
        password: '',
        confirmPassword: '',
        brainKeyGenerated: authStore.generateBrainKey(),
    })

    const currentForm = useCallback(() => {
        switch (currentStep) {
            case STEP_OPTIONS.SETUP_ACCOUNT_NAME_AND_PASSWORD:
                return (
                    <Form
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 12 }}
                        onSubmit={handleContinueClick}
                        className={'center'}
                    >
                        <Form.Item label="Display Name">
                            {getFieldDecorator('displayName', {
                                initialValue: initialValues.displayName,
                                rules: [
                                    { required: false, message: 'Please enter a display name.' },
                                ],
                            })(
                                <Input
                                    size={'large'}
                                    placeholder={'Enter your preferred display name'}
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="Password">
                            {getFieldDecorator('password', {
                                initialValue: initialValues.password,
                                rules: [
                                    { required: false, message: 'Please enter your password.' },
                                ],
                            })(
                                <Input
                                    size={'large'}
                                    placeholder={
                                        'Enter the password you want to use to encrypt your account.'
                                    }
                                    type={'password'}
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="Confirmed Password">
                            {getFieldDecorator('confirmPassword', {
                                initialValue: initialValues.confirmPassword,
                                rules: [
                                    { required: false, message: 'Please re-enter your password.' },
                                ],
                            })(
                                <Input
                                    size={'large'}
                                    placeholder={'Re-enter your password'}
                                    type={'password'}
                                />
                            )}
                        </Form.Item>
                    </Form>
                )
            case STEP_OPTIONS.GENERATE_BRAIN_KEY:
                return (
                    <>
                        <div className={'measure'}>
                            <span className={'f6 mb3 db'}>
                                The Brainkey is the seed phrase from which your public-private key
                                pairs are generated. You can restore the public-private key pairs
                                from your Brainkey if you lose the keys.{' '}
                                <strong>The Brainkey itself cannot be restored once lost!</strong>
                            </span>
                            <div className={'flex flex-row flex-wrap'}>
                                {initialValues.brainKeyGenerated.split(' ').map((item, index) => {
                                    return (
                                        <span
                                            key={index}
                                            className={
                                                'flex flex-row items-center w4 f5 pa3 mr2 mb2 ba b--light-gray'
                                            }
                                        >
                                            <span className={'moon-gray f3 mr2'}>{index + 1} </span>
                                            <span className={'black b'}>{item}</span>
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )
            case STEP_OPTIONS.CONFIRM_BRAIN_KEY:
                return (
                    <Form
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 12 }}
                        onSubmit={handleContinueClick}
                        className={'center'}
                    >
                        <Form.Item label="Brain Key">
                            {getFieldDecorator('brainKeyConfirm', {
                                rules: [
                                    { required: false, message: 'Please re-enter your brain key' },
                                ],
                            })(
                                <TextArea
                                    rows={6}
                                    placeholder={
                                        'Please re-enter your BK to confirm you have copied it down'
                                    }
                                />
                            )}
                        </Form.Item>
                    </Form>
                )
        }
    }, [currentStep])

    return (
        <Modal
            width={window.innerWidth / 1.5}
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={
                <Footer
                    step={currentStep}
                    next={next}
                    back={back}
                    handleContinueClick={handleContinueClick}
                    createAccountLoading={createAccountLoading}
                />
            }
        >
            <Content step={currentStep} next={next} back={back} currentForm={currentForm} />
        </Modal>
    )
}

ModalsSignUp.defaultProps = {}

const Wrapped = Form.create({ name: 'signUpModal' })(ModalsSignUp)

export default observer(Wrapped) as any
