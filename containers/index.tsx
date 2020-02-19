import * as React from 'react'
import * as ReactDOM from 'react-dom'
import 'antd/dist/antd.less'
import '../assets/main.scss'

import serviceWorker from '@containers/serviceWorker'
import App from '@containers/app'

ReactDOM.render(<App />, document.getElementById('app'))
serviceWorker()
