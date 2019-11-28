import * as React from 'react'
import Link from 'next/link'
import { getDefaultIdenticon } from '@utils'

interface IUserNameWithIconProps {
    imageSize?: number
    imageData: string
    name: string
    pub: string
}

const UserNameWithIcon: React.FC<IUserNameWithIconProps> = ({
    imageSize,
    imageData,
    name,
    pub,
}) => {
    let size = imageSize

    if (!imageSize || typeof imageSize === 'undefined') {
        size = 15
    }

    const image = (
        <img width={size} height={size} src={imageData} className={'post-icon mr2'} alt={'Icon'} />
    )

    const user = <span>{name}</span>

    if (imageData === getDefaultIdenticon) {
        return (
            <span
                className={'flex items-center'}
                title={
                    'Since no pub key was found for this post, you cannot use user actions on this user'
                }
            >
                {image}
                {user}
            </span>
        )
    }

    return (
        <object className={'z-2'}>
            <Link href={`/u/[username]`} as={`/u/${name}-${pub}`}>
                <a className={'flex items-center dim pointer'}>
                    {image}
                    {user}
                </a>
            </Link>
        </object>
    )
}

export default UserNameWithIcon
