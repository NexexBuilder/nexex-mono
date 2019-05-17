import {createAction} from 'redux-actions';
import {Amount} from '../../../utils/Amount';
import {updatePluginAccess} from '../ethereum.action';

export enum ETHWrapDialogActionType {
    DIALOG_SHOW = 'eth_wrap_dialog/DIALOG_SHOW',
    DIALOG_CLOSE = 'eth_wrap_dialog/DIALOG_CLOSE',
    FORM_AMOUNT_UPDATE = 'eth_wrap_dialog/FORM_AMOUNT_UPDATE',
    // NEXT_STEP = 'eth_wrap_dialog/NEXT_STEP',
    // LAST_STEP = 'eth_wrap_dialog/LAST_STEP',
}

export const showDialog = createAction(ETHWrapDialogActionType.DIALOG_SHOW);
// export type UpdateWalletAddrAction = ReturnType<typeof updateWalletAddr>;

export const closeDialog = createAction(ETHWrapDialogActionType.DIALOG_CLOSE);
export const updateFormAmount = createAction(ETHWrapDialogActionType.FORM_AMOUNT_UPDATE,
    (amount: Amount) => amount);
export type UpdateFormAmountAction = ReturnType<typeof updateFormAmount>;
// export const nextStep = createAction(ETHWrapDialogActionType.NEXT_STEP);
// export const lastStep = createAction(ETHWrapDialogActionType.LAST_STEP);
