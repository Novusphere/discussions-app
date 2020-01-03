import * as React from 'react'

import './style.scss'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faShare } from '@fortawesome/free-solid-svg-icons'
import copy from 'clipboard-copy'
import { CSSTransition } from 'react-transition-group'
import { tweetCurrentPage } from '@utils'

interface ISharePostProps {
    toggleAddAsModerator: () => void
    toggleBlockPost: (uuid: string) => void
    id: string
}

const SharePost: React.FC<ISharePostProps> = ({ toggleBlockPost, id, toggleAddAsModerator }) => {
    const [inProp, setInProp] = useState(false)

    const renderIcon = () => {
        return (
            <span
                onClick={() => {
                    setInProp(!inProp)
                }}
            >
                <FontAwesomeIcon
                    width={13}
                    icon={faShare}
                    color={'#b0b0b0'}
                    className={'pr3 dim f6 pointer'}
                />
            </span>
        )
    }

    return (
        <div className={'disable-user-select flex flex-row items-center'}>
            <CSSTransition unmountOnExit in={inProp} timeout={200} classNames={'slide'}>
                <div>
                    <span
                        className={'pr3 f6 b0b0b0 dim pointer'}
                        onClick={() => toggleBlockPost(id)}
                    >
                        mark as spam
                    </span>

                    <span
                        className={'pr3 f6 b0b0b0 dim pointer'}
                        onClick={toggleAddAsModerator}
                    >
                        assign moderation
                    </span>

                    <span
                        className={'pr3 f6 b0b0b0 dim pointer'}
                        title={'Copy URL to clipboard'}
                        onClick={() => copy(window.location.href.split('#')[0])}
                    >
                        permalink
                    </span>

                    <span
                        className={'pr3 f6 b0b0b0 dim pointer'}
                        onClick={tweetCurrentPage}
                        title={'Share to Twitter'}
                    >
                        twitter
                    </span>
                </div>
            </CSSTransition>
            {renderIcon()}
        </div>
    )
}

export default SharePost
