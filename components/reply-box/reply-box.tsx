import * as React from 'react'
// import { Editor } from '@components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { observer } from 'mobx-react'
import classNames from 'classnames'

import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('../editor/editor'), {
    ssr: false,
})

interface IReplyProps {
    className?: string
    uid: string // the uid of the post this component is active for
    onContentChange: (content: string) => void
    onSubmit: (uid: string) => Promise<boolean | void>
}

const ReplyBox: React.FC<IReplyProps> = ({ uid, onContentChange, onSubmit, className }) => (
    <div
        className={classNames([
            {
                mt3: typeof className === 'undefined',
                [className]: !!className,
            },
        ])}
    >
        <Editor placeholder={'Enter your reply'} className={'db f6'} onChange={onContentChange} />
        {onSubmit['match']({
            pending: () => (
                <button
                    disabled
                    className={'mt3 f6 link dim ph3 pv2 dib mr2 pointer white bg-green'}
                >
                    <FontAwesomeIcon width={13} icon={faSpinner} spin />
                </button>
            ),
            rejected: error => (
                <div className={'flex flex-column items-start'}>
                    <span className={'red f6 pt3'}>{error.message}</span>
                    <button
                        onClick={() =>
                            onSubmit(uid).catch(err => {
                                console.error(err)
                            })
                        }
                        className={'mt3 f6 link dim ph3 pv2 dib mr2 pointer white bg-green'}
                    >
                        Post reply
                    </button>
                </div>
            ),
            resolved: status => (
                <div className={'flex flex-column items-start'}>
                    {status ? <span className={'green f6 pt3'}>Post submitted!</span> : null}
                    <button
                        onClick={() =>
                            onSubmit(uid).catch(err => {
                                console.error(err)
                            })
                        }
                        className={'mt3 f6 link dim ph3 pv2 dib mr2 pointer white bg-green'}
                    >
                        Post reply
                    </button>
                </div>
            ),
        })}
    </div>
)

export default observer(ReplyBox)
