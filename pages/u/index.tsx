import * as React from 'react'
import { dummy } from '@novuspherejs'
import moment from 'moment'

interface IUPageProps {
    username: string
    data: any
}

class U extends React.Component<IUPageProps> {
    static async getInitialProps({ ctx: { query } }) {
        const userData = await dummy.getUser(query.username)
        return {
            username: query.username,
            data: userData,
        }
    }

    public render(): React.ReactNode {
        const { data } = this.props

        return (
            <div className={'card pa4'}>
                <div className={'flex items-center justify-between'}>
                    <span className={'black lh-copy'}>
                        <h2 className={'pa0 ma0'}>{this.props.username}</h2>
                        <h4 className={'pa0 ma0 o-50'}>Last active: {moment(data.lastActivity).fromNow()}</h4>
                    </span>
                    <span>
                        <button
                            onClick={() => console.log('add follow logic')}
                            className={'f6 link dim ph3 pv2 dib pointer white bg-green mr2'}
                        >
                            Follow
                        </button>
                        <button
                            onClick={() => console.log('add block logic')}
                            className={'f6 link dim ph3 pv2 dib pointer white bg-red'}
                        >
                            Block
                        </button>
                    </span>
                </div>
                <div className={'flex items-center mt3'}>
                    <span className={'mr3'}>Followers: {data.followers}</span>
                    <span className={'mr3'}>Comments: {data.comments.length}</span>
                    <span className={'mr3'}>Threads: {data.threads.length}</span>
                </div>
            </div>
        )
    }
}


export default U
