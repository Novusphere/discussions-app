import * as React from 'react'

import './style.scss'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faShare } from '@fortawesome/free-solid-svg-icons'
import copy from 'clipboard-copy'
import { CSSTransition } from 'react-transition-group'

interface ISharePostProps {}

const SharePost: React.FC<ISharePostProps> = () => {
    const [inProp, setInProp] = useState(false)

    const renderIcon = () => {
        return (
            <span
                onClick={() => {
                    setInProp(!inProp)
                }}
            >
                <FontAwesomeIcon width={13} icon={faShare} className={'pr3 black f6 pointer'} />
            </span>
        )
    }

    return (
        <div className={'disable-user-select flex flex-row items-center'}>
            <CSSTransition unmountOnExit in={inProp} timeout={200} classNames={'slide'}>
                <div>
                    <span
                        className={'pr3 black f6 pointer mr1'}
                        title={'Permalink'}
                        onClick={() => copy(window.location.href.split('#')[0])}
                    >
                        <span className={'f6 black'}>permalink</span>
                    </span>

                    <span className={'f6 black mr3'}>
                        mark as spam
                    </span>
                </div>
            </CSSTransition>
            {renderIcon()}
        </div>
    )
}

export default SharePost
