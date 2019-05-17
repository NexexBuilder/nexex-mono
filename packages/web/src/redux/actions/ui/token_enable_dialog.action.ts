import {ERC20Token} from '@nexex/types';
import {createAction} from 'redux-actions';

export enum TokenEnableDialogActionType {
    DIALOG_SHOW = 'token_enable_dialog/DIALOG_SHOW',
    DIALOG_CLOSE = 'token_enable_dialog/DIALOG_CLOSE'
}

export const showDialog = createAction(
    TokenEnableDialogActionType.DIALOG_SHOW,
    (tokens: Array<ERC20Token>) => tokens
);
export type ShowDialogAction = ReturnType<typeof showDialog>;

export const closeDialog = createAction(
    TokenEnableDialogActionType.DIALOG_CLOSE
);
