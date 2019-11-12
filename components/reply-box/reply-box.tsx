import * as React from 'react'
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
    onSubmit: (uid: string) =>any

    value?: string
    loading: boolean
}

const ReplyBox: React.FC<IReplyProps> = ({
    uid,
    onContentChange,
    onSubmit,
    loading,
    className,
    value,
}) => {
    return (
        <div
            className={classNames([
                {
                    mt3: typeof className === 'undefined',
                    [className]: !!className,
                },
            ])}
        >
            <Editor
                placeholder={'Enter your reply'}
                className={'db f6'}
                value={value}
                onChange={onContentChange}
            />

            <div className={'flex flex-column items-start'}>
                <button
                    disabled={loading}
                    className={'mt3 f6 link dim ph3 pv2 dib mr2 pointer white bg-green'}
                    onClick={() => {
                        onSubmit(uid).catch(err => {
                            console.error(err)
                        })
                    }}
                >
                    {loading ? <FontAwesomeIcon width={13} icon={faSpinner} spin /> : 'Post reply'}
                </button>
            </div>
        </div>
    )
}

export default observer(ReplyBox)
