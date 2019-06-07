//#region Global Imports
import { Props } from 'react';
//#endregion Global Imports

//#region Interface Imports
import { IHomePage, ITopNavbarPage } from '@Interfaces';
//#endregion Interface Imports

export type IStore = {
    topNavbar: ITopNavbar.IStateProps
    home: IHomePage.IStateProps
}