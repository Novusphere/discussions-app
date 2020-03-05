import React from 'react'
import { Result, Icon } from 'antd'
import Helmet from 'react-helmet'

export default () => {
    return (
        <>
            <Helmet>
                <title>{'404 Not Found'}</title>
            </Helmet>
            <Result
                icon={<Icon type="frown" theme="twoTone" twoToneColor={'#079e99'} />}
                title="404"
                subTitle="Sorry, this page does not exist."
            />
        </>
    )
}
