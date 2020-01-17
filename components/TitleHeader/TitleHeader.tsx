import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import Link from 'next/link'
import { IStores } from '@stores'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from 'react-tippy'
import { ModalOptions } from '@globals'
import { UserNotifications } from '@components'
import { getIdenticon } from '@utils'

import './style.scss'
import { log } from 'util'

interface ITitleHeaderProps {
    tagStore: IStores['tagStore']
    authStore: IStores['authStore']
    notificationsStore: IStores['notificationsStore']
    userStore: IStores['userStore']
    uiStore: IStores['uiStore']
}

interface ITitleHeaderState {
    search: string
}

@inject('tagStore', 'authStore', 'userStore', 'uiStore', 'notificationsStore')
@observer
class TitleHeader extends React.Component<ITitleHeaderProps, ITitleHeaderState> {
    state = {
        search: '',
    }

    componentDidMount(): void {
        this.props.authStore.checkInitialConditions()
    }

    private renderUserSettings = () => {
        const {
            logOut,
            hasScatterAccount,
            activePublicKey,
            activeDisplayName,
            balances,
        } = this.props.authStore

        return (
            <div className={'tooltip flex flex-column'} style={{ width: 200 }}>
                <a rel={'Logout'} onClick={logOut}>
                    logout
                </a>

                <Link href={`/u/[username]`} as={`/u/${activeDisplayName}-${activePublicKey}`}>
                    <a rel={'Open your profile'}>profile</a>
                </Link>

                <Link href={'/settings/[setting]'} as={'/settings/connections'}>
                    <a rel={'Open settings'}>settings</a>
                </Link>

                <Link href={'/settings/[setting]'} as={'/settings/connections'}>
                    <a rel={'Open connections'}>connections</a>
                </Link>

                <Link href={'/settings/[setting]'} as={'/settings/wallet?side=0'}>
                    <a rel={'Open your wallet'}>wallet</a>
                </Link>

                {balances.size && (
                    <Link href={'/settings/[setting]'} as={'/settings/wallet?side=0'}>
                        <a rel={'View your balances'}>
                            <hr className={'mv0 mh0'} />
                            {Array.from(balances).map(([symbol, amount]) => (
                                <span key={symbol} className={'db'} style={{ paddingLeft: 0 }}>
                                    {amount} {symbol}
                                </span>
                            ))}
                        </a>
                    </Link>
                )}
            </div>
        )
    }

    private renderAuthActions = () => {
        const { notificationsStore, userStore } = this.props
        const { showModal } = this.props.uiStore
        const {
            hasAccount,
            activeDisplayName,
            checkInitialConditions,
            activePublicKey,
        } = this.props.authStore

        if (checkInitialConditions['pending']) {
            return <FontAwesomeIcon width={13} icon={faSpinner} spin />
        }

        if (hasAccount) {
            const { hasNotifications, notificationCount } = notificationsStore

            return (
                <div className={'f4 flex items-center'}>
                    <Tooltip
                        animateFill={false}
                        interactive
                        interactiveBorder={20}
                        unmountHTMLWhenHide={true}
                        html={
                            <UserNotifications
                                notificationsStore={notificationsStore}
                                userStore={userStore}
                            />
                        }
                        position={'bottom-end'}
                        trigger={'mouseenter'}
                    >
                        <Link href={'/notifications'}>
                            <a rel={'Open your notifications'}>
                                <FontAwesomeIcon
                                    width={13}
                                    icon={faBell}
                                    className={'ph2'}
                                    color={hasNotifications ? '#ad3b2b' : '#7D8894'}
                                />
                                {hasNotifications && (
                                    <span className={'f5 b notification-count'}>
                                        {notificationCount}
                                    </span>
                                )}
                            </a>
                        </Link>
                    </Tooltip>
                    <Link href={`/new`}>
                        <button title={'Create new post'} className={'ml3'}>
                            <span className={'f6 white'}>New Post</span>
                        </button>
                    </Link>
                    <Tooltip
                        animateFill={false}
                        interactive
                        interactiveBorder={20}
                        unmountHTMLWhenHide={true}
                        html={this.renderUserSettings()}
                        position={'bottom-end'}
                        trigger={'mouseenter'}
                    >
                        <Link
                            href={`/u/[username]`}
                            as={`/u/${activeDisplayName}-${activePublicKey}`}
                        >
                            <a
                                rel={'Open your profile'}
                                className={'flex items-center user-container pointer dim'}
                            >
                                <span className={'b f6 pl1 pr3 black'}>{activeDisplayName}</span>
                                <img
                                    width={30}
                                    height={30}
                                    src={getIdenticon(activePublicKey)}
                                    className={'post-icon mr2'}
                                    alt={'Icon'}
                                />
                            </a>
                        </Link>
                    </Tooltip>
                </div>
            )
        }

        return (
            <>
                <button
                    className={'button-outline mr2'}
                    onClick={() => showModal(ModalOptions.signIn)}
                >
                    Login
                </button>
                <button
                    onClick={() => {
                        showModal(ModalOptions.signUp)
                    }}
                >
                    Sign Up
                </button>
            </>
        )
    }

    private renderActiveTag = () => {
        return (
            <Link href={'/'} prefetch={false}>
                <a>home</a>
            </Link>
        )
    }

    private handleKeySearch = e => {
        const key = e.key

        if (key.match(/NumpadEnter|Enter/)) {
            const value = e.target.value
            Router.push({ pathname: '/search', query: { q: value } })
            e.preventDefault()
        }
    }

    public render(): React.ReactNode {
        return (
            <div className={'card title-header flex items-center z-999'}>
                <div className={'container flex items-center justify-between'}>
                    <span className={'f4 black'}>{this.renderActiveTag()}</span>

                    <div
                        className={
                            'mh4 flex-auto relative flex items-center main-search field-container'
                        }
                    >
                        <input
                            className={'w-100 pl4'}
                            placeholder={'Search on Discussions.app'}
                            onKeyDown={this.handleKeySearch}
                        />
                        <FontAwesomeIcon
                            width={13}
                            icon={faSearch}
                            className={'absolute left-0 ml2 pl1'}
                        />
                    </div>

                    <div className={'flex'}>{this.renderAuthActions()}</div>
                </div>
            </div>
        )
    }
}

export default TitleHeader as any
