import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { observer } from 'mobx-react'

interface IVoteProps {
    uuid: string
    upVotes: number
    downVotes: number
    className?: string
    handler: (uuid: string, type: string, value: number) => Promise<void>
}

const Vote: React.FC<IVoteProps> = ({ uuid, upVotes, downVotes, handler, ...props }) => (
    <span
        className={'black f6 vote flex flex-column items-center ph1 disable-user-select'}
        {...props}
    >
        <span onClick={async () => await handler(uuid, 'upvotes', upVotes + 1)}>
            <FontAwesomeIcon width={13} icon={faArrowUp} className={'o-50 dim pointer'} />
        </span>
        <span className={'f6 b pr1'}>{upVotes + downVotes}</span>
        <span onClick={async () => await handler(uuid, 'downvotes', downVotes - 1)}>
            <FontAwesomeIcon width={13} icon={faArrowDown} className={'o-50 dim pointer'} />
        </span>
    </span>
)

export default observer(Vote)
