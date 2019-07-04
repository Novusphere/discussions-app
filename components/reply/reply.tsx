import * as React from 'react'
import { Editor } from '@components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { observer } from 'mobx-react'

interface IReplyProps {
    onContentChange: (content: string) => void
    onSubmit: () => Promise<boolean | void>
}

const Reply: React.FC<IReplyProps> = ({ onContentChange, onSubmit }) => (
    <div className={'mt3'}>
        <Editor placeholder={'Enter your reply'} className={'db f6'} onChange={onContentChange} />
        {onSubmit['match']({
            pending: () => (
                <button
                    disabled
                    className={'mt3 f6 link dim br2 ph3 pv2 dib mr2 pointer white bg-green'}
                >
                    <FontAwesomeIcon icon={faSpinner} spin />
                </button>
            ),
            rejected: error => (
                <div className={'flex flex-column'}>
                    <span className={'red f6 pt3'}>{error.message}</span>
                    <button
                        onClick={() =>
                            onSubmit().catch(err => {
                                console.error(err)
                            })
                        }
                        className={'mt3 f6 link dim br2 ph3 pv2 dib mr2 pointer white bg-green'}
                    >
                        Post reply
                    </button>
                </div>
            ),
            resolved: status => (
                <div className={'flex flex-column'}>
                    {status ? <span className={'green f6 pt3'}>Post submitted!</span> : null}
                    <button
                        onClick={() =>
                            onSubmit().catch(err => {
                                console.error(err)
                            })
                        }
                        className={'mt3 f6 link dim br2 ph3 pv2 dib mr2 pointer white bg-green'}
                    >
                        Post reply
                    </button>
                </div>
            ),
        })}
    </div>
)

export default observer(Reply)
