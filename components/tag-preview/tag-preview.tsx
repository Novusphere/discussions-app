import * as React from 'react'
import { TagModel } from '@models/tagModel'

interface ITagPreviewProps {
    tag: TagModel
}

// mouse over tag html
const TagPreview: React.FC<ITagPreviewProps> = ({ tag }) => {
    const renderActiveTag = () => {
        return (
            <div className={'pa4 bg-white shadow'}>
                <span className={'flex flex-row items-center'}>
                    <img
                        src={tag.icon}
                        title={`${tag.name} icon`}
                        className={'tag-image w-10 mr2'}
                    />
                    <span className={'b black f5'}>e/{tag.name}</span>
                </span>

                <span className={'flex row black mt2 f6 tl'}>{tag.tagDescription}</span>

                <span className={'flex row fa5 mt2 f5'}>{tag.memberCount} Members</span>
                <span className={'flex row fa5 mt2 f5'}>0 members online</span>
                <div className={'flex flex-column items-center justify-center mt3'}>
                    <button className={'w-100 mb2'}>Join Community</button>
                </div>
            </div>
        )
    }

    return <div className={'interactive-hover'}>{renderActiveTag()}</div>
}

export default TagPreview
