import * as React from 'react'
import { observer } from 'mobx-react'
import TagStore from '../../stores/tag'
import { Link } from '@router'
import { withRouter } from 'next/router'
import classNames from 'classnames'
import { TagModel } from '@models/tagModel'
import { Tooltip } from 'react-tippy'
import { TagPreview } from '@components'

interface ITagListProps {
    activeTag: TagModel
    tags: TagStore['tags']
    router: any
}

const Sidebar: React.FC<ITagListProps> = ({ tags, activeTag, ...props }) => {
    const renderActiveTag = () => {
        if (activeTag) {
            return (
                <div className={'pa4 bg-white shadow'}>
                    <span className={'flex flex-row items-center'}>
                        <img
                            src={activeTag.icon}
                            title={`${activeTag.name} icon`}
                            className={'activeTag-image w-10 mr2'}
                        />
                        <span className={'b black f6'}>e/{activeTag.name}</span>
                    </span>

                    <span className={'flex row fa5 mt2 f5'}>{activeTag.memberCount} Members</span>

                    <span className={'flex row black mt2 f6'}>{activeTag.tagDescription}</span>

                    <div className={'flex flex-column items-center justify-center mt3'}>
                        <button className={'w-100 mb2'}>Join Community</button>
                        <button className={'w-100 button-outline'}>Create Post</button>
                    </div>
                </div>
            )
        }

        return null
    }

    return (
        <>
            {renderActiveTag()}
            <ul className={'w-100'}>
                {Array.from(tags.values())
                    .filter(tag => tag.root)
                    .map(tag => (
                        <li
                            key={tag.id}
                            className={classNames([
                                'ph3 pb3',
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
                <div className={'divider-line mb2'} />
                {Array.from(tags.values())
                    .filter(tag => !tag.root)
                    .map(tag => (
                        <li
                            key={tag.id}
                            className={classNames([
                                'ph3 pb3',
                                {
                                    active: props.router.asPath === tag.url,
                                },
                            ])}
                        >
                            <Tooltip
                                animateFill={false}
                                interactive
                                html={<TagPreview tag={tag} />}
                                position={'left-end'}
                                offset={600}
                                className={'interactive-hover'}
                                distance={400}
                                trigger={'mouseenter'}
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
                            </Tooltip>
                        </li>
                    ))}
            </ul>
        </>
    )
}

export default withRouter(observer(Sidebar))
