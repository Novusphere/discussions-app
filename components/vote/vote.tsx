import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'

interface IVoteProps {
    votes: number
    className?: string
}

const Vote: React.FC<IVoteProps> = ({ votes, ...props }) => (
    <span className={'black f6 vote flex flex-column items-center ph1'} {...props}>
        <FontAwesomeIcon icon={faArrowUp} className={'o-50 dim pointer'} />
        <span className={'f6 b pr1'}>{votes}</span>
        <FontAwesomeIcon icon={faArrowDown} className={'o-50 dim pointer'} />
    </span>
)

export default Vote
