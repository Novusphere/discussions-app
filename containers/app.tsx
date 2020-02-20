import React from 'react'
import Routes from '@routes'
import { InjectStoreContext } from '@stores'
import { BrowserRouter as Router } from 'react-router-dom'
import { deleteAllCookies } from '@utils'

class App extends React.Component<any, any> {
    componentDidMount(): void {
        deleteAllCookies()
    }

    public render() {
        return (
            <InjectStoreContext initialData={null}>
                <Router>
                    <Routes />
                </Router>
            </InjectStoreContext>
        )
    }
}

export default App
