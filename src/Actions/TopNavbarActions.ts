import { ActionConsts } from "@Definations";

/**
 * ACTIONS
*/
export const TopNavbarActions = {
	Map: (payload: any) => (
		{
			payload,
			type: ActionConsts.TopNavbar.SetReducer
		}
	),

	Reset: () => ({
		type: ActionConsts.TopNavbar.ResetReducer
	})
}