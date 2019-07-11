import * as React from 'react'
import { observer } from 'mobx-react'
import TagStore from '../../stores/tag'
import { Link } from '@router'
import { withRouter } from 'next/router'
import classNames from 'classnames'

interface ITagListProps {
    tags: TagStore['tags']
    router: any
}

const Sidebar: React.FC<ITagListProps> = ({ tags, ...props }) => {
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
                            <a className={'db black pointer pb1 no-underline'}>{tag.name}</a>
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
                        <Link route={'tag'} params={{ name: tag.name }}>
                            <a className={'flex items-center pb1 pointer'}>
                                <img
                                    className={'tag-icon pr2'}
                                    src={tag.icon}
                                    alt={`${tag.name} icon`}
                                />
                                <span className={'db black no-underline'}>
                                    {'#'}
                                    {tag.name}
                                </span>
                            </a>
                        </Link>
                    </li>
                ))}
        </ul>
    )
}

export default withRouter(observer(Sidebar))
