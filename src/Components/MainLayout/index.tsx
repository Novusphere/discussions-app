//#region Global Imports
import * as React from 'react';
//#endregion Global Imports

//#region Local Imports
//#endregion Local Imports

//#region Interface Imports
import { IMainLayout } from '@Interfaces';
import { SplashHeader } from '@Components';

//#endregion Interface Imports

class MainLayout extends React.Component<IMainLayout.IProps, IMainLayout.IState> {

	constructor(props: IMainLayout.IProps) {
		super(props);

		this.state = {};
	}

	public render(): JSX.Element {
		return (
			<>
				<SplashHeader/>
				{this.props.children}
			</>
		);
	}
}

export default MainLayout;
