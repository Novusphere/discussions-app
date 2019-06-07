import { combineReducers } from 'redux';

import { TopNavbarReducer } from './topNavbar';

import { ActiveCategoryOrTag } from './home';

export default combineReducers({
    topNavbar: TopNavbarReducer,
	home: ActiveCategoryOrTag
});
