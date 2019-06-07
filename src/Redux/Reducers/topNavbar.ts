//#region Local Imports
import { ActionConsts } from '@Definations';
//#endregion Local Imports

//#region Interface Imports
import { IAction, ITopNavbar } from '@Interfaces';
//#endregion Interface Imports

/**
 * INITIAL_STATE
*/
const INITIAL_STATE: ITopNavbar.IStateProps = { };

type IMapPayload = ITopNavbar.Actions.IMapPayload;

export const TopNavbarReducer = (state = INITIAL_STATE, action: IAction<IMapPayload>) => {
	switch (action.type) {
		case ActionConsts.TopNavbar.SetReducer:
			return {
				...state,
				...action.payload
			};

		case ActionConsts.TopNavbar.ResetReducer:
			return INITIAL_STATE;

		default:
			return state;
	}
};
