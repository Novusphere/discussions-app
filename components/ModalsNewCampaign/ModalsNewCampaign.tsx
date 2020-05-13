import React, { FunctionComponent, useCallback } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select } from 'antd'
import { Editor, TokenSelect } from '@components'

import styles from './ModalsNewCampaign.module.scss'

interface IModalsNewCampaignProps {
    visible: boolean
    handleOk: () => void
    handleCancel: () => void
    form?: any
}

const ModalsNewCampaign: FunctionComponent<IModalsNewCampaignProps> = ({
    visible,
    handleCancel,
    handleOk,
    form,
}) => {
    const { getFieldDecorator } = form
    const footer = useCallback(() => {
        return [<Button key="saveButton">Save</Button>]
    }, [])

    const handleTokenChange = useCallback(val => {
        form.setFieldsValue({
            token: val,
        })
    }, [])

    return (
        <Modal
            width={window.innerWidth / 1.5}
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={footer()}
        >
            <span className={'db f4 b black'}>Create a campaign</span>
            <Form onSubmit={() => console.log('hey')} className={'w-90'}>
                <Form.Item label={'Token'}>
                    {getFieldDecorator('token', {
                        rules: [
                            {
                                required: true,
                                message: 'Please select a token',
                            },
                        ],
                    })(<TokenSelect handleTokenChange={handleTokenChange} />)}
                </Form.Item>
                <Form.Item label={'Title'}>
                    {getFieldDecorator('name', {
                        rules: [
                            {
                                required: true,
                                message: 'Please enter a name for your campaign',
                            },
                        ],
                    })(<Input size={'large'} placeholder={'Name your campaign'} />)}
                </Form.Item>
                <Form.Item label={'Content'}>
                    {getFieldDecorator('content', {
                        rules: [
                            {
                                required: true,
                                message: 'Please enter content for your post',
                            },
                        ],
                    })(<Editor />)}
                </Form.Item>
                <span className={'db f5 b black pv3'}>Set your reward</span>
                <Form.Item label={'Amount'}>
                    {getFieldDecorator('rewardAmount', {
                        rules: [
                            {
                                required: true,
                                message: 'Please set an amount',
                            },
                        ],
                    })(<Input size={'large'} />)}
                </Form.Item>
                <Form.Item label={'Token'}>
                    {getFieldDecorator('rewardToken', {
                        rules: [
                            {
                                required: true,
                                message: 'Please select a token',
                            },
                        ],
                    })(<TokenSelect handleTokenChange={handleTokenChange} />)}
                </Form.Item>
            </Form>
        </Modal>
    )
}

ModalsNewCampaign.defaultProps = {}

export default Form.create({ name: 'newCampaignForm' })(ModalsNewCampaign)
