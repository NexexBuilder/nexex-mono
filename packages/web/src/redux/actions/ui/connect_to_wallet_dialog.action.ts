import {createAction} from 'redux-actions';

export enum ConnectToWalletDialogActionType {
    DIALOG_SHOW = 'connect_to_wallet/DIALOG_SHOW',
    DIALOG_CLOSE = 'connect_to_wallet/DIALOG_CLOSE',
}

export const showDialog = createAction(ConnectToWalletDialogActionType.DIALOG_SHOW);
// export type UpdateWalletAddrAction = ReturnType<typeof updateWalletAddr>;

export const closeDialog = createAction(ConnectToWalletDialogActionType.DIALOG_CLOSE);
