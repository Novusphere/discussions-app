import * as React from 'react';
import { observer, inject } from 'mobx-react';

import '../styles/style.scss';

@inject('userStore')
@observer
class Index extends React.Component<any, any> {
	constructor(props: any) {
		super(props);
	}

	render() {

		return (
			<div className={'container'}>
				<p>
					{this.props.userStore.username}
				</p>
				<p>
					You can start now!!!
				</p>
			</div>
		);
	}
}

export default Index;
