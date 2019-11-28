import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { observer } from 'mobx-react'
import classNames from 'classnames'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { RichTextPreview } from '@components'

const Editor = dynamic(() => import('../Editor/Editor'), {
    ssr: false,
})

interface IReplyProps {
    className?: string
    uid: string // the uid of the post this component is active for
    onContentChange: (content: string) => void
    onSubmit: (uid: string) => any

    value?: string
    loading: boolean

    id?: string
    open: boolean
}

const ReplyBox: React.FC<IReplyProps> = ({
    uid,
    onContentChange,
    onSubmit,
    loading,
    className,
    value,
    id,
    open,
}) => {
    const [showPreview, setPreviewState] = useState(false)
    const [content, setContent] = useState(null)

    return (
        <div
            {...(id && { id })}
            className={classNames([
                {
                    mt3: typeof className === 'undefined',
                    [className]: !!className,
                },
            ])}
            style={{
                display: open ? 'block' : 'none',
            }}
        >
            <Editor
                placeholder={'Enter your reply'}
                className={'db f6'}
                value={value}
                onChange={content => {
                    onContentChange(content)
                    setContent(content)
                }}
            />

            <div className={'flex flex-row items-center'}>
                <button
                    disabled={loading}
                    className={'mt3 f6 link dim ph3 pv2 dib mr2 pointer white bg-gray'}
                    onClick={() => setPreviewState(true)}
                >
                    Preview
                </button>
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

            {showPreview && (
                <div className={'flex flex-row mt3 card pa2'}>
                    <RichTextPreview className={'w-100'}>{content}</RichTextPreview>
                </div>
            )}
        </div>
    )
}

export default observer(ReplyBox)
