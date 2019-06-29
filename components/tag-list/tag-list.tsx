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

const TagList: React.FC<ITagListProps> = ({ tags, ...props }) => {
    return (
        <ul>
            {Array.from(tags.values()).map(tag => (
                <li
                    key={tag.id}
                    className={classNames([
                        {
                            active: props.router.asPath === tag.url,
                        },
                    ])}
                >
                    <Link route={tag.url}>
                        <a className={'db black pointer pb1 no-underline'}>
                            {tag.root ? null : '#'}
                            {tag.name}
                        </a>
                    </Link>
                </li>
            ))}
        </ul>
    )
}

export default withRouter(observer(TagList))
