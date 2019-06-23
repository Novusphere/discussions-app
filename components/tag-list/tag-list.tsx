import * as React from 'react'
import { observer } from 'mobx-react'
import TagStore from '../../stores/tag'
import { Link } from '@router'

interface ITagListProps {
    tags: TagStore['tags']
}

const TagList: React.FC<ITagListProps> = ({ tags }) => {
    return Array.from(tags.values()).map(tag => (
        <Link route={tag.url ? tag.url : `/tag/${tag.name}`}>
            <span className={'db black dim pointer pb1'} key={tag.id}>
                {tag.root ? null : '#'}
                {tag.name}
            </span>
        </Link>
    ))
}

export default observer(TagList)
