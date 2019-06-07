import { combineReducers } from 'redux';

import { ActiveCategoryOrTag } from './home';

export default combineReducers({
	home: ActiveCategoryOrTag
});
