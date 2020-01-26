import * as React from 'react'
import { TagModel } from '@models/tagModel'
import { observer } from 'mobx-react'
import Link from 'next/link'

interface ITagPreviewProps {
    tag: TagModel

    isSubscribed: boolean
    toggleSubscribe: (name: string) => void
}

// mouse over tag html
const TagPreview: React.FC<ITagPreviewProps> = ({ tag, isSubscribed, toggleSubscribe }) => {
    const renderActiveTag = () => {
        return (
            <div className={'pa4 bg-white shadow'} style={{ width: '400px', height: '200px'}}>
                <Link href={`/tag/[name]`} as={`/tag/${tag.name}`}>
                    <a className={'flex flex-row items-center dim'}>
                        <img
                            src={tag.icon}
                            title={`${tag.name} icon`}
                            className={'tag-image w-10 mr2'}
                        />
                        <span className={'b black f5'}>#{tag.name}</span>
                    </a>
                </Link>

                {tag.tagDescription.length > 0 && <span className={'flex row black mt2 f6 tl'}>{tag.tagDescription}</span>}

                {typeof tag.memberCount !== 'undefined' && <span className={'flex row fa5 mt2 f5'}>{tag.memberCount} Members</span>}
                <div className={'flex flex-column items-center justify-center mt3'}>
                    <button className={'w-100 mb2'} onClick={() => toggleSubscribe(tag.name)}>
                        {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                    </button>
                </div>
            </div>
        )
    }

    return <div className={'interactive-hover'}>{renderActiveTag()}</div>
}

export default observer(TagPreview)
