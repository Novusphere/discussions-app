import * as React from 'react'
import { observer } from 'mobx-react'

@observer
class E extends React.Component<any, any> {
	static async getInitialProps({ query }) {
		console.log('SLUG', query.slug)
		return {}
	}

	public render(): React.ReactNode {
		return <span>Page!</span>
	}
}

export default E
