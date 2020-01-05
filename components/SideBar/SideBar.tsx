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
import { faPlus } from '@fortawesome/free-solid-svg-icons'

interface ITagListOuterProps {
    className: string
}

interface ITagListInnerProps {
    router: NextRouter
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    authStore: IStores['authStore']
}

interface ITagListState {
    isScrolling: boolean
    tag: string
}

@(withRouter as any)
@inject('tagStore', 'postsStore', 'authStore')
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
            postsStore: { newPostData },
            router,
        } = this.props

        newPostData.sub = {
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

            this.props.tagStore.addTag(this.state.tag)
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
        const { activeTag, toggleTagSubscribe, subSubscriptionStatus } = this.props.tagStore

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
                    {tag.name}
                </a>
            </Link>
        )
    }

    private handleAddTagChange = e => {
        this.setState({
            tag: e.target.value,
        })
    }

    private handleAddTag = () => {
        this.props.tagStore.addTag(this.state.tag, () => {
            this.setState({
                tag: '',
            })
        })
    }

    render() {
        const {
            className,
            router,
            tagStore: {
                tags,
                subscribedSubsAsModels,
                subSubscriptionStatus,
                toggleTagSubscribe,
            },
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
                    {!this.props.authStore.hasAccount && <div className={'divider-line mb2'} />}
                    {this.props.authStore.hasAccount && (
                        <div className={'field-container mb2 relative flex-auto flex items-center'}>
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
                                <FontAwesomeIcon
                                    width={13}
                                    icon={faPlus}
                                    title={'Click to add tag'}
                                />
                            </span>
                        </div>
                    )}
                    {subscribedSubsAsModels
                        .filter(tag => !tag.root)
                        .map((tag, index) => (
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
                                    open={true}
                                    disabled={this.state.isScrolling}
                                    animateFill={false}
                                    interactive
                                    html={
                                        <TagPreview
                                            tag={tag}
                                            isSubscribed={
                                                subSubscriptionStatus.indexOf(tag.name) !== -1
                                            }
                                            toggleSubscribe={toggleTagSubscribe}
                                        />
                                    }
                                    position={'left-end'}
                                    unmountHTMLWhenHide={false}
                                    offset={0}
                                    stickyDuration={0}
                                    sticky={true}
                                    duration={0}
                                    animation={'fade'}
                                    className={'interactive-hover'}
                                    distance={0}
                                    trigger={'mouseenter focus'}
                                >
                                    <Link href={`/tag/[name]`} as={`/tag/${tag.name}`}>
                                        <a className={'flex items-center pb1 pointer'}>
                                            {this.renderTagLi(tag)}
                                        </a>
                                    </Link>
                                </Tooltip>
                            </li>
                        ))}
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
