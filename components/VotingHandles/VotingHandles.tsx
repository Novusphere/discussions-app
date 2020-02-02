import * as React from 'react'
import { Icon } from 'antd'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

interface IVoteProps {
    uuid: string
    upVotes: number
    downVotes: number
    myVote: number
    className?: string
    handler: (e: any, uuid: string, value: number) => void
    color?: string
    horizontal?: boolean
}

const VotingHandles: React.FC<IVoteProps> = ({
    uuid,
    upVotes,
    downVotes,
    myVote,
    handler,
    color,
    horizontal,
    ...props
}) => {
    return (
        <span
            className={classNames(['black f6 vote flex items-center disable-user-select ph1'], {
                'flex-row': horizontal,
                'flex-column': !horizontal,
            })}
            {...props}
        >
            <span
                onClick={e => {
                    e.preventDefault()
                    handler(e, uuid, 1)
                }}
            >
                <Icon
                    type="caret-up"
                    style={{
                        color: myVote === 1 ? '#FF6300' : '#b9b9b9',
                    }}
                />
            </span>
            <span
                className={classNames(['f6 disable-user-select ph1'])}
                style={{ color: color ? color : '#b9b9b9', whiteSpace: 'pre' }}
            >
                {upVotes - downVotes}
            </span>
            <span
                onClick={e => {
                    e.preventDefault()
                    handler(e, uuid, -1)
                }}
            >
                <Icon
                    type="caret-down"
                    style={{
                        color: myVote === -1 ? '#00449E' : '#b9b9b9',
                    }}
                />
            </span>
        </span>
    )
}

export default observer(VotingHandles)
