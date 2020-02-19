import React from 'react'
import Routes from '@routes'
import { InjectStoreContext } from '@stores'
import { BrowserRouter as Router } from 'react-router-dom'

class App extends React.Component<any, any> {
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
