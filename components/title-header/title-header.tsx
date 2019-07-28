import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Link } from '@router'
import { IStores } from '@stores'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faEnvelope,
    faPen,
    faPenAlt,
    faSearch,
    faSpinner,
    faUser,
} from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from 'react-tippy'
import { ModalOptions } from '@globals'

interface ITitleHeaderProps {
    tagStore: IStores['tagStore']
    authStore: IStores['authStore']
    uiStore: IStores['uiStore']
}

@inject('tagStore', 'authStore', 'uiStore')
@observer
class TitleHeader extends React.Component<ITitleHeaderProps> {
    private renderUserSettings = () => {
        const { logOut, ATMOSBalance } = this.props.authStore

        return (
            <div className={'tooltip'} style={{ width: 200 }}>
                <Link route={'/settings'}>
                    <a rel={'Open settings'} className={'db mb2'}>
                        settings
                    </a>
                </Link>
                <a title={'ATMOS Balance'} className={'db mb2'}>
                    {ATMOSBalance} ATMOS
                </a>
                <a
                    rel={'Open settings'}
                    className={'db pointer'}
                    onClick={() => {
                        logOut()
                    }}
                >
                    {logOut['match']({
                        pending: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
                        rejected: () => 'Unable to disconnect',
                        resolved: () => 'disconnect',
                    })}
                </a>
            </div>
        )
    }

    private renderAuthActions = () => {
        const { isLoggedIn, accountName, logIn } = this.props.authStore
        const { showModal } = this.props.uiStore

        if (logIn['state'] === 'pending') {
            return <FontAwesomeIcon width={13} icon={faSpinner} spin />
        }

        if (isLoggedIn) {
            return (
                <div className={'f4 flex items-center'}>
                    <Link route={`/new`}>
                        <a rel={'Create a new post'}>
                            <FontAwesomeIcon width={13} icon={faPen} className={'ph2'} />
                        </a>
                    </Link>
                    <Link route={'/notifications'}>
                        <a rel={'Open your notifications'}>
                            <FontAwesomeIcon width={13} icon={faEnvelope} className={'ph2'} />
                        </a>
                    </Link>
                    <Tooltip
                        interactive
                        html={this.renderUserSettings()}
                        position={'bottom-end'}
                        trigger={'mouseenter'}
                        animation={'none'}
                        duration={0}
                    >
                        <Link route={`/u/${accountName}`}>
                            <a
                                rel={'Open your profile'}
                                className={'flex items-center user-container pointer dim'}
                            >
                                <FontAwesomeIcon width={13} icon={faUser} />
                                <span className={'b f6 pl3 pr1'}>{accountName}</span>
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
                <button onClick={() => showModal(ModalOptions.signUp)}>Sign Up</button>
            </>
        )
    }

    private renderActiveTag = () => {
        const { activeTag } = this.props.tagStore

        if (!activeTag) {
            return (
                <Link route={'/'}>
                    <a>home</a>
                </Link>
            )
        }

        return (
            <Link route={activeTag.url}>
                <a className={'flex items-center'}>
                    {!activeTag.icon ? null : (
                        <img
                            className={'tag-icon pr2'}
                            src={activeTag.icon}
                            alt={`${activeTag.name} icon`}
                        />
                    )}

                    <span>{activeTag.name}</span>
                </a>
            </Link>
        )
    }

    public render(): React.ReactNode {
        return (
            <div className={'title-header flex items-center z-999'}>
                <div className={'container flex items-center justify-between'}>
                    <span className={'f4 black'}>{this.renderActiveTag()}</span>
                    <div className={'mh4 flex-auto relative flex items-center'}>
                        <input className={'w-100 main-search pl4'} placeholder={'Search EOS'} />
                        <FontAwesomeIcon
                            width={13}
                            icon={faSearch}
                            className={'absolute left-0 ml2 pl1'}
                        />
                    </div>
                    <Link route={'/new'}>
                        <button className={'button-outline ph3 mr2'}>
                            <FontAwesomeIcon icon={faPenAlt} />
                        </button>
                    </Link>
                    <div className={'flex'}>{this.renderAuthActions()}</div>
                </div>
            </div>
        )
    }
}

export default TitleHeader as any
