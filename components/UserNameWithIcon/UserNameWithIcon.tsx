import React, { FunctionComponent } from 'react'
import { Avatar, Icon } from 'antd'

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
                    <a className={'flex items-center dim pointer'}>{name}</a>
                </Link>
            </object>
        </>
    )
}

UserNameWithIcon.defaultProps = {}

export default UserNameWithIcon
