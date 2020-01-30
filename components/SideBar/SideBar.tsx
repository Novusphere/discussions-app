import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Link from 'next/link'
import { NextRouter, withRouter } from 'next/router'
import classNames from 'classnames'
import { Tooltip } from 'react-tippy'
import { TagPreview } from '@components'
import { IStores } from '@stores'

import './style.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { sanityCheckTag } from '@utils'
import _ from 'lodash'

interface ITagListOuterProps {
    className: string
}

interface ITagListInnerProps {
    router: NextRouter
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    authStore: IStores['authStore']
    settingsStore: IStores['settingsStore']
}

interface ITagListState {
    isScrolling: boolean
    tag: string
}

@(withRouter as any)
@inject('tagStore', 'postsStore', 'authStore', 'settingsStore')
@observer
class SideBar extends React.Component<ITagListOuterProps & ITagListInnerProps, ITagListState> {
    private sidebarContainer = React.createRef<HTMLUListElement>()
    private scrollTimeout: any

    state = {
        isScrolling: false,
        tag: '',
    }

    private createPost = () => {
        const {
            tagStore: { activeTag },
            router,
        } = this.props

        this.props.postsStore.newPostTag = {
            value: activeTag.name,
            label: activeTag.name,
        }

        return router.push('/new')
    }

    private enterKeyEventListener = (e: KeyboardEvent) => {
        const key = e.code

        if (!this.state.tag) return

        if (key.match(/NumpadEnter|Enter/)) {
            e.preventDefault()
            this.handleAddTag()
        }
    }

    componentDidMount(): void {
        this.addEnterListener()
    }

    componentWillUnmount(): void {
        this.removeEnterListener()
    }

    private addEnterListener = () => {
        if (this.sidebarContainer) {
            this.sidebarContainer.current.addEventListener('scroll', this.handleScroll, true)
        }

        window.addEventListener('keypress', this.enterKeyEventListener)
    }

    private removeEnterListener = () => {
        if (this.sidebarContainer) {
            this.sidebarContainer.current.removeEventListener('scroll', this.handleScroll, true)
        }

        window.removeEventListener('keypress', this.enterKeyEventListener)
    }

    private handleScroll = () => {
        if (this.scrollTimeout) {
            //if there is already a timeout in process cancel it
            clearTimeout(this.scrollTimeout)
        }

        this.scrollTimeout = setTimeout(() => {
            this.scrollTimeout = null
            this.setState({
                isScrolling: false,
            })
        }, 500)

        if (!this.state.isScrolling) {
            this.setState({
                isScrolling: true,
            })
        }
    }

    private renderActiveTag = () => {
        const { loadSettings } = this.props.settingsStore
        const {
            toggleTagSubscribe,
            subSubscriptionStatus,
            tagModelFromObservables,
            activeSlug,
        } = this.props.tagStore
        const activeTag = tagModelFromObservables(activeSlug)

        if (loadSettings['pending']) {
            return (
                <div
                    className={'card flex flex-row items-center justify-center'}
                    style={{ height: '230px' }}
                >
                    <FontAwesomeIcon icon={faSpinner} spin />
                </div>
            )
        }

        if (activeTag) {
            const isSubbed = subSubscriptionStatus.indexOf(activeTag.name) !== -1
            return (
                <div className={'card pa4'}>
                    <span className={'flex flex-row items-center'}>
                        <img
                            src={activeTag.icon}
                            title={`${activeTag.name} icon`}
                            className={'activeTag-image w-10 mr2'}
                        />
                        <span className={'b black f6'}>#{activeTag.name}</span>
                    </span>

                    {activeTag.memberCount !== undefined && (
                        <span className={'flex row fa5 mt2 f5'}>
                            {activeTag.memberCount} Members
                        </span>
                    )}

                    {activeTag.tagDescription !== undefined && (
                        <span className={'flex row black mt2 f6'}>{activeTag.tagDescription}</span>
                    )}

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
        const getUrl = url => {
            switch (url) {
                case 'all':
                    return '/all'
                case 'feed':
                    return '/feed'
                case 'home':
                    return '/'
            }
        }

        const url = getUrl(tag.name)

        return (
            <Link href={url} as={tag.url}>
                <a className={'db black pointer pb1 no-underline'}>
                    <FontAwesomeIcon width={13} icon={tag.icon} className={'mr2'} />
                    {_.startCase(tag.name)}
                </a>
            </Link>
        )
    }

    private handleAddTagChange = e => {
        const value = e.target.value

        this.setState({
            tag: value,
        })
    }

    private handleAddTag = () => {
        this.props.tagStore.addTag(sanityCheckTag(this.state.tag), () => {
            this.setState({
                tag: '',
            })
        })
    }

    private renderTags = () => {
        const {
            router,
            settingsStore: { loadSettings },
            tagStore: {
                tagModelFromObservables,
                tagGroup,
                subSubscriptionStatus,
                toggleTagSubscribe,
            },
        } = this.props

        if (loadSettings['pending']) {
            return (
                <div
                    className={'flex flex-row items-center justify-center'}
                    style={{ height: '200px' }}
                >
                    <FontAwesomeIcon icon={faSpinner} spin />
                </div>
            )
        }

        return (
            <>
                <div className={'divider-line mv2'} />

                {[...tagGroup.entries()].map(([name, tags]) => {
                    const _name = name.toLowerCase()
                    const as = `/tags/${tags.join(',')}`
                    return (
                        <li
                            className={classNames([
                                'ph3 pv1',
                                {
                                    dim: router.asPath !== as,
                                    'sidebar-link-active': router.asPath === as,
                                },
                            ])}
                            key={_name}
                        >
                            <Link href={`/tags/[tags]`} as={as} shallow={true}>
                                <a className={'db black pointer mb1 pv1 no-underline'}>{name}</a>
                            </Link>
                        </li>
                    )
                })}

                {this.props.authStore.hasAccount && (
                    <div className={'field-container mb2 relative flex-auto flex items-center mt3'}>
                        <input
                            value={this.state.tag}
                            onChange={this.handleAddTagChange}
                            className={'w-100 tag-search pl4 f6'}
                            placeholder={'Add a tag to subscribe'}
                        />
                        <span
                            onClick={this.handleAddTag}
                            className={'absolute plus-icon ml2 pl1 dim pointer'}
                        >
                            <FontAwesomeIcon width={13} icon={faPlus} title={'Click to add tag'} />
                        </span>
                    </div>
                )}
                {subSubscriptionStatus.map(tag => {
                    const model = tagModelFromObservables(tag)
                    if (!model) return null
                    return (
                        <li
                            key={model.id}
                            className={classNames([
                                'ph3',
                                {
                                    dim: router.query.name !== model.name,
                                    'sidebar-link-active': router.query.name === model.name,
                                },
                            ])}
                        >
                            <Tooltip
                                disabled={this.state.isScrolling}
                                animateFill={false}
                                interactive
                                html={
                                    <TagPreview
                                        tag={model}
                                        isSubscribed={
                                            subSubscriptionStatus.indexOf(model.name) !== -1
                                        }
                                        toggleSubscribe={toggleTagSubscribe}
                                    />
                                }
                                position={'left-end'}
                                unmountHTMLWhenHide={false}
                                offset={150}
                                stickyDuration={0}
                                sticky={true}
                                duration={0}
                                animation={'fade'}
                                className={'interactive-hover'}
                                distance={350}
                                trigger={'mouseenter focus'}
                            >
                                <Link
                                    href={`/tag/[name]`}
                                    as={`/tag/${model.name}`}
                                    shallow={false}
                                >
                                    <a className={'flex items-center mb1 pv1 pointer'}>
                                        {this.renderTagLi(model)}
                                    </a>
                                </Link>
                            </Tooltip>
                        </li>
                    )
                })}
            </>
        )
    }

    render() {
        const {
            className,
            router,
            settingsStore: { loadSettings },
            tagStore: { tags, subSubscriptionStatus, toggleTagSubscribe },
        } = this.props

        return (
            <div className={className}>
                {this.renderActiveTag()}
                <ul className={'card mt0 pv4 ph2 list'} ref={this.sidebarContainer}>
                    {Array.from(tags.values())
                        .filter(tag => tag.root)
                        .map(tag => (
                            <li
                                key={tag.id}
                                className={classNames([
                                    'ph3 pv1',
                                    {
                                        dim: router.asPath !== tag.url,
                                        'sidebar-link-active': router.asPath === tag.url,
                                    },
                                ])}
                            >
                                {this.renderTopLevelTags(tag)}
                            </li>
                        ))}
                    {this.renderTags()}
                </ul>
            </div>
        )
    }

    private renderTagLi = (tag: any) => {
        return (
            <>
                <img className={'tag-icon pr2'} src={tag.icon} alt={`${tag.name} icon`} />
                <span className={'db black no-underline'}>
                    {'#'}
                    {tag.name}
                </span>
            </>
        )
    }
}

export default SideBar as React.ComponentClass<ITagListOuterProps>
