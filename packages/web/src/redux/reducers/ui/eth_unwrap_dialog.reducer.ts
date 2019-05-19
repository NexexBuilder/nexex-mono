import update from 'immutability-helper';
import {handleActions} from 'redux-actions';
import {AmountUnit} from '../../../constants';
import {Amount} from '../../../utils/Amount';
import {ETHUnwrapDialogActionType, UpdateFormAmountAction} from '../../actions/ui/eth_unwrap_dialog.action';

export interface EthUnwrapDialogState {
    isOpen: boolean;
    formAmount: Amount;
}

const defaultState: EthUnwrapDialogState = {
    isOpen: false,
    formAmount: new Amount(0, AmountUnit.WEI, 0)
};

export default handleActions<EthUnwrapDialogState, any>(
    {
        [ETHUnwrapDialogActionType.DIALOG_SHOW]:
            (state) =>
                update(state, {$merge: {isOpen: true}})
        ,
        [ETHUnwrapDialogActionType.DIALOG_CLOSE]:
            (state) =>
                update(state, {$set: defaultState})
        ,
        [ETHUnwrapDialogActionType.FORM_AMOUNT_UPDATE]:
            (state, action: UpdateFormAmountAction) =>
                update(state, {formAmount: {$set: action.payload}})

    }, defaultState
);
