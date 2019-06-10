//#region Global Imports
import { HomeActions } from '@Actions';
import * as React from 'react';
//#endregion Global Imports

//#region Local Imports
import './style.scss';
//#endregion Local Imports

//#region Interface Imports
import { IThreadView } from '@Interfaces';

//#endregion Interface Imports

class ThreadView extends React.Component<IThreadView.IProps, IThreadView.IState> {
	public static async getInitialProps({query, store}) {
		const {category, id, title} = query;
		store.dispatch(HomeActions.Map({
										   category,
										   id,
										   title,
									   }));

		return query;
	}

	public render(): JSX.Element {
		return (
			<div className="ThreadView">
				Category: {this.props.category}
				Post Id: {this.props.id}
				Title: {this.props.title}
			</div>
		);
	}
}

export default ThreadView;
