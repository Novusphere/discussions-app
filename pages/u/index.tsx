import * as React from 'react'

interface IUPageProps {
    username: string
}

class U extends React.Component<IUPageProps> {
    static async getInitialProps({ ctx: { query } }) {
        return {
            username: query.username,
        }
    }

    public render(): React.ReactNode {
        return <span>{this.props.username}</span>
    }
}


export default U
