import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Link from 'next/link'
import { NextRouter, withRouter } from 'next/router'
import classNames from 'classnames'
import { Tooltip } from 'react-tippy'
import { TagPreview } from '@components'
import { IStores } from '@stores'

import './style.scss'

interface ITagListOuterProps {}

interface ITagListInnerProps {
    router: NextRouter
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
}

@inject('tagStore', 'postsStore')
@observer
class Sidebar extends React.Component<ITagListOuterProps & ITagListInnerProps> {
    private createPost = () => {
        const {
            tagStore: { activeTag },
            postsStore: { newPostData },
            router,
        } = this.props

        newPostData.sub = {
            value: activeTag.name,
            label: activeTag.name,
        }

        return router.push('/new')
    }

    private renderActiveTag = () => {
        const { activeTag, toggleTagSubscribe, subSubscriptionStatus } = this.props.tagStore

        if (activeTag) {
            const isSubbed = subSubscriptionStatus.get(activeTag.name)
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
                        <button
                            className={'w-100 mb2'}
                            onClick={() => toggleTagSubscribe(activeTag.name)}
                        >
                            {isSubbed ? 'Unsubscribe' : 'Subscribe'}
                        </button>
                        <button className={'w-100 button-outline'} onClick={this.createPost}>
                            Create Post
                        </button>
                    </div>
                </div>
            )
        }

        return null
    }

    private renderTopLevelTags = tag => {
        if (tag.name === 'all') {
            return (
                <Link href={'/all'} as={tag.url}>
                    <a className={'db black pointer pb1 no-underline'}>{tag.name}</a>
                </Link>
            )
        }

        if (tag.name === 'feed') {
            return (
                <Link href={'/feed'} as={tag.url}>
                    <a className={'db black pointer pb1 no-underline'}>{tag.name}</a>
                </Link>
            )
        }

        if (tag.name === 'home') {
            return (
                <Link href={'/'} as={tag.url}>
                    <a className={'db black pointer pb1 no-underline'}>{tag.name}</a>
                </Link>
            )
        }

        return (
            <Link href={'/tag/[name]'} as={tag.url}>
                <a className={'db black pointer pb1 no-underline'}>{tag.name}</a>
            </Link>
        )
    }

    render() {
        const {
            router,
            tagStore: { tags, subSubscriptionStatus, toggleTagSubscribe },
        } = this.props

        return (
            <>
                {this.renderActiveTag()}
                <ul className={'w-100'}>
                    {Array.from(tags.values())
                        .filter(tag => tag.root)
                        .map(tag => (
                            <li
                                key={tag.id}
                                className={classNames([
                                    'ph3 mb3',
                                    {
                                        dim: router.asPath !== tag.url,
                                        'sidebar-link-active': router.asPath === tag.url,
                                    },
                                ])}
                            >
                                {this.renderTopLevelTags(tag)}
                            </li>
                        ))}
                    <div className={'divider-line mb2'} />
                    {Array.from(tags.values())
                        .filter(tag => !tag.root)
                        .map(tag => (
                            <li
                                key={tag.id}
                                className={classNames([
                                    'ph3',
                                    {
                                        dim: router.query.name !== tag.name,
                                        'sidebar-link-active': router.query.name === tag.name,
                                    },
                                ])}
                            >
                                <Tooltip
                                    animateFill={false}
                                    interactive
                                    html={
                                        <TagPreview
                                            tag={tag}
                                            isSubscribed={subSubscriptionStatus.get(tag.name)}
                                            toggleSubscribe={toggleTagSubscribe}
                                        />
                                    }
                                    position={'left-end'}
                                    unmountHTMLWhenHide={true}
                                    offset={150}
                                    stickyDuration={0}
                                    sticky={true}
                                    duration={275}
                                    animation={'fade'}
                                    className={'interactive-hover'}
                                    distance={400}
                                    trigger={'mouseenter focus'}
                                >
                                    <Link href={`/tag/[name]`} as={`/tag/${tag.name}`}>
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
}

export default withRouter(observer(Sidebar)) as React.ComponentClass<ITagListOuterProps>
