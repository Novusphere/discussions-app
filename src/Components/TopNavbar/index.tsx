//#region Global Imports
import * as React from 'react';
import { connect } from 'react-redux';
//#endregion Global Imports

//#region Local Imports
import './style.scss';
//#endregion Local Imports

//#region Interface Imports
import { ITopNavbar } from '@Interfaces';
//#endregion Interface Imports

class TopNavbar extends React.Component<ITopNavbar.IProps, ITopNavbar.IState> {

	constructor(props: ITopNavbar.IProps) {
		super(props);

		this.state = {
		};
	}

	public render(): JSX.Element {
		return (
			<div className="TopNavbar">
				TopNavbar
			</div>
		);
	}
}

const mapStateToProps = state => state;

export default connect(mapStateToProps, null)(TopNavbar);

