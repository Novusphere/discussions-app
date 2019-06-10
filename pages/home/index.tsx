//#region Global Imports
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Head from 'next/head';
//#endregion Global Imports

//#region Interface Imports
import { IHomePage, IStore } from '@Interfaces';
import { HomeActions } from '@Actions';
import TopNavbar from '@Components/TopNavbar';

//#endregion Interface Imports

export class HomePage extends React.Component<IHomePage.IProps, IHomePage.IState> {

	constructor(props: IHomePage.IProps) {
		super(props);
	}

	public render(): JSX.Element {
		return (
			<>
				<Head>
					<title>A decentralized forum | Home</title>
				</Head>
				<TopNavbar/>
				<div className="title">
					Hello!
				</div>
			</>
		);
	}
}

const mapStateToProps = (state: IStore) => state.home;

const mapDispatchToProps = (dispatch: Dispatch) => (
	{
		Map: bindActionCreators(HomeActions.Map, dispatch)
	}
);

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
