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
            className={classNames(
                ['black f5 vote flex items-center disable-user-select ph1'],
                props.className,
                {
                    'flex-row': horizontal,
                    'flex-column': !horizontal,
                }
            )}
            {...props}
        >
            <span
                className={'silver'}
                onClick={e => {
                    e.preventDefault()
                    handler(e, uuid, 1)
                }}
            >
                <Icon
                    className={'pointer hover-orange'}
                    type="caret-up"
                    style={{
                        color: myVote === 1 ? '#FF6300' : '#999999',
                    }}
                />
            </span>
            <span
                className={classNames(['f6 disable-user-select ph1 silver'])}
                style={{
                    whiteSpace: 'pre',
                    color: myVote === 1 ? '#FF6300' : myVote === -1 ? '#357EDD' : '#999999',
                }}
            >
                {upVotes - downVotes}
            </span>
            <span
                className={'silver'}
                onClick={e => {
                    e.preventDefault()
                    handler(e, uuid, -1)
                }}
            >
                <Icon
                    className={'link pointer hover-blue'}
                    type="caret-down"
                    style={{
                        color: myVote === -1 ? '#357EDD' : '#999999',
                    }}
                />
            </span>
        </span>
    )
}

export default observer(VotingHandles)
