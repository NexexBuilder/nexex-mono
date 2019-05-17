import {createAction} from 'redux-actions';
import {Amount} from '../../../utils/Amount';

export enum ETHUnwrapDialogActionType {
    DIALOG_SHOW = 'eth_unwrap_dialog/DIALOG_SHOW',
    DIALOG_CLOSE = 'eth_unwrap_dialog/DIALOG_CLOSE',
    FORM_AMOUNT_UPDATE = 'eth_unwrap_dialog/FORM_AMOUNT_UPDATE',
}

export const showDialog = createAction(ETHUnwrapDialogActionType.DIALOG_SHOW);
// export type UpdateWalletAddrAction = ReturnType<typeof updateWalletAddr>;

export const closeDialog = createAction(ETHUnwrapDialogActionType.DIALOG_CLOSE);

export const updateFormAmount = createAction(ETHUnwrapDialogActionType.FORM_AMOUNT_UPDATE,
    (amount: Amount) => amount);
export type UpdateFormAmountAction = ReturnType<typeof updateFormAmount>;
