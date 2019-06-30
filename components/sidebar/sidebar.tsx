import * as React from 'react'
import { observer } from 'mobx-react'
import TagStore from '../../stores/tag'
import { Link } from '@router'
import { withRouter } from 'next/router'
import classNames from 'classnames'

interface ITagListProps {
    tags: TagStore['tags']
    router: any
    onClick: (tag: any) => void
}

const Sidebar: React.FC<ITagListProps> = ({ tags, onClick, ...props }) => {
    return (
        <ul className={'w-100'}>
            {Array.from(tags.values())
                .filter(tag => tag.root)
                .map(tag => (
                    <li
                        key={tag.id}
                        className={classNames([
                            {
                                active: props.router.asPath === tag.url,
                            },
                        ])}
                    >
                        <Link route={tag.url}>
                            <a
                                className={'db black pointer pb1 no-underline'}
                                onClick={() => onClick(tag)}
                            >
                                {tag.name}
                            </a>
                        </Link>
                    </li>
                ))}
            <div className={'divider-line'} />
            {Array.from(tags.values())
                .filter(tag => !tag.root)
                .map(tag => (
                    <li
                        key={tag.id}
                        className={classNames([
                            {
                                active: props.router.asPath === tag.url,
                            },
                        ])}
                    >
                        <Link route={tag.url}>
                            <span className={'flex items-center pb1 pointer'} onClick={() => onClick(tag)}>
                                <img
                                    className={'tag-icon pr2'}
                                    src={tag.icon}
                                    alt={`${tag.name} icon`}
                                />
                                <a className={'db black no-underline'}>
                                    {'#'}
                                    {tag.name}
                                </a>
                            </span>
                        </Link>
                    </li>
                ))}
        </ul>
    )
}

export default withRouter(observer(Sidebar))
