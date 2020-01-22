import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { observer } from 'mobx-react'
import classNames from 'classnames'

interface IVoteProps {
    uuid: string
    upVotes: number
    downVotes: number
    myVote: number
    className?: string
    handler: (uuid: string, value: number) => void
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
}) => (
    <span
        className={classNames(['black f6 vote flex items-center disable-user-select ph1'], {
            'flex-row': horizontal,
            'flex-column': !horizontal,
        })}
        {...props}
    >
        <span onClick={() => handler(uuid, myVote === 0 ? 1 : 0)}>
            <FontAwesomeIcon
                width={13}
                icon={faArrowUp}
                color={color ? color : '#b9b9b9'}
                className={classNames([
                    'pointer disable-user-select',
                    {
                        'o-50 dim': myVote !== 1,
                        orange: myVote === 1,
                    },
                ])}
            />
        </span>
        <span
            className={classNames(['f6 disable-user-select ph1'])}
            style={{ color: color ? color : '#b9b9b9', whiteSpace: 'pre' }}
        >
            {upVotes - downVotes}
        </span>
        <span onClick={() => handler(uuid, myVote === 0 ? -1 : 0)}>
            <FontAwesomeIcon
                width={13}
                color={color ? color : '#b9b9b9'}
                icon={faArrowDown}
                className={classNames([
                    'pointer disable-user-select',
                    {
                        'o-50 dim': myVote !== -1,
                        blue: myVote === -1,
                    },
                ])}
            />
        </span>
    </span>
)

export default observer(VotingHandles)
