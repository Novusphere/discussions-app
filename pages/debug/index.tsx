import * as React from 'react'

class Debug extends React.Component<any, any> {
    state = {
        auth: null,
        user: null,
        tags: null,
        settings: null,
    }

    componentDidMount(): void {
        this.setState({
            auth: window.localStorage.getItem('auth'),
            user: window.localStorage.getItem('user'),
            tags: window.localStorage.getItem('tags'),
            settings: window.localStorage.getItem('settings'),
        })
    }

    public render() {
        const { auth, user, tags, settings } = this.state
        return (
            <div className={'w-100'} style={{ wordBreak: 'break-all' }}>
                <span className={'mv3 db'}>{auth}</span>
                <span className={'mv3 db'}>{user}</span>
                <span className={'mv3 db'}>{tags}</span>
                <span className={'mv3 db'}>{settings}</span>
            </div>
        )
    }
}

export default Debug
