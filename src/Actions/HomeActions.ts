//#region Local Imports
import { ActionConsts } from '@Definations';
//#endregion Local Imports

//#region Interface Imports
//#endregion Interface Imports

export const HomeActions = {
	Map: (payload: any) => (
		{
			payload,
			type: ActionConsts.Home.SetReducer,
		}
	),

	Reset: () => ({
		type: ActionConsts.Home.ResetReducer,
	}),
};
