import * as React from 'react'
import {observer} from "mobx-react";
import TagStore from '../../stores/tag'

interface ITagListProps {
    tags: TagStore['tags']
}


const TagList: React.FC<ITagListProps> = ({ tags }) => {
    return Array.from(tags.values()).map(tag => (
        <span className={'db black dim pointer pb1'} key={tag.id}>
            {tag.root ? null : '#'}
            {tag.name}</span>
    ))
}

export default observer(TagList)
