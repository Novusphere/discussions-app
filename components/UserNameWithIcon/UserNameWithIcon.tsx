import React, { FunctionComponent } from 'react'
import { Avatar } from 'antd'

import styles from './UserNameWithIcon.module.scss'
import { Link } from 'react-router-dom'

interface IUserNameWithIconProps {
    imageData: string
    pub: string
    name: string
}

const UserNameWithIcon: FunctionComponent<IUserNameWithIconProps> = ({ imageData, pub, name }) => {
    return (
        <>
            <Avatar icon={'user'} src={imageData} size={'small'} />
            <object className={'z-2 pl2'}>
                <Link to={`/u/${name}-${pub}`}>
                    <span className={'flex items-center dim pointer'}>{decodeURIComponent(name)}</span>
                </Link>
            </object>
        </>
    )
}

UserNameWithIcon.defaultProps = {}

export default UserNameWithIcon
