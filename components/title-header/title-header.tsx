import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Link } from '@router'
import { IStores } from '@stores/index'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faPen, faUser } from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from 'react-tippy'

interface ITitleHeaderProps {
    tagStore: IStores['tagStore']
    authStore: IStores['authStore']
}

@inject('tagStore', 'authStore')
@observer
class TitleHeader extends React.Component<ITitleHeaderProps> {
    private renderUserSettings = () => {
        const { logOut } = this.props.authStore

        return (
            <div className={'tooltip'} style={{ width: 150 }}>
                <Link route={'/settings'}>
                    <a rel={'Open settings'} className={'db mb2'}>
                        settings
                    </a>
                </Link>
                <a rel={'Open settings'} className={'db pointer'} onClick={() => {
                    logOut()
                }}>
                    disconnect
                </a>
            </div>
        )
    }

    private renderAuthActions = () => {
        const { isLoggedIn, accountName } = this.props.authStore

        if (isLoggedIn) {
            return (
                <div className={'f4 flex items-center'}>
                    <Link route={'/e/all/new'}>
                        <a rel={'Create a new post'}>
                            <FontAwesomeIcon icon={faPen} className={'ph2'} />
                        </a>
                    </Link>
                    <Link route={'/messages'}>
                        <a rel={'Open your messages'}>
                            <FontAwesomeIcon icon={faEnvelope} className={'ph2'} />
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
                        <a
                            rel={'Open your profile'}
                            className={'flex items-center user-container pointer dim'}
                        >
                            <FontAwesomeIcon icon={faUser} />
                            <span className={'b f6 pl3 pr1'}>{accountName}</span>
                        </a>
                    </Tooltip>
                </div>
            )
        }

        return (
            <>
                <a className="f6 link dim br2 ph3 pv2 dib white bg-green mr2" href="#0">
                    Login
                </a>
                <Link route={'/settings'}>
                    <a className="f6 link dim br2 ph3 pv2 dib white bg-green mr2">Set ID</a>
                </Link>
            </>
        )
    }

    private renderActiveTag = () => {
        const { activeTag } = this.props.tagStore

        if (!activeTag) {
            return <>home</>
        }

        return (
            <span className={'flex items-center'}>
                {!activeTag.icon ? null : (
                    <img
                        className={'tag-icon pr2'}
                        src={this.props.tagStore.activeTag.icon}
                        alt={`${this.props.tagStore.activeTag.name} icon`}
                    />
                )}

                <span>{this.props.tagStore.activeTag.name}</span>
            </span>
        )
    }

    public render(): React.ReactNode {
        return (
            <div className={'title-header flex items-center z-999'}>
                <div className={'container flex items-center justify-between'}>
                    <span className={'f4 black'}>{this.renderActiveTag()}</span>
                    <div className={'flex'}>{this.renderAuthActions()}</div>
                </div>
            </div>
        )
    }
}

export default TitleHeader as any
