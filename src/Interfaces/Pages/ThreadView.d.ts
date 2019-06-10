//#region Global Imports
import { Props } from 'react';
//#endregion Global Imports

declare module IThreadView {
	export interface IProps extends Props<{}> {
		category: string;
		id: string;
		title: string;
	}

	export interface IState {
	}

	export interface IStateProps {
	}

}
