import * as React from 'react'
import { observer } from 'mobx-react'

@observer
class E extends React.Component<any, any> {
	static async getInitialProps() {
		console.log('params')
		return {}
	}

	public render(): React.ReactNode {
		return <span>Page2!</span>
	}
}

export default E
