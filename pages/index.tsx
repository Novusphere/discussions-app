import * as React from 'react';
import { observer, inject } from 'mobx-react';

@inject('userStore')
@observer
class Index extends React.Component<any, any> {
	constructor(props: any) {
		super(props);
	}

	render() {

		return (
			<>
				<p>
					{this.props.userStore.username}
				</p>
			</>
		);
	}
}

export default Index;
