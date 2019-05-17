import update from 'immutability-helper';
import {handleActions} from 'redux-actions';
import {AmountUnit} from '../../../constants';
import {Amount} from '../../../utils/Amount';
import {ETHWrapDialogActionType, UpdateFormAmountAction} from '../../actions/ui/eth_wrap_dialog.action';

interface EthWrapDialogState {
    isOpen: boolean;
    formAmount: Amount;
    currentStep: number;
}

const defaultState: EthWrapDialogState = {
    isOpen: false,
    formAmount: new Amount(0, AmountUnit.WEI, 0),
    currentStep: 0
};

export default handleActions<EthWrapDialogState, any>(
    {
        [ETHWrapDialogActionType.DIALOG_SHOW]:
            (state) =>
                update(state, {$merge: {isOpen: true}})
        ,
        [ETHWrapDialogActionType.DIALOG_CLOSE]:
            (state) =>
                update(state, {$set: defaultState})
        ,
        [ETHWrapDialogActionType.FORM_AMOUNT_UPDATE]:
            (state, action: UpdateFormAmountAction) =>
                update(state, {formAmount: {$set: action.payload}})
        ,
        // [ETHWrapDialogActionType.NEXT_STEP]:
        //     (state) =>
        //         update(state, {currentStep: {$set: state.currentStep + 1}})
        // ,
        // [ETHWrapDialogActionType.LAST_STEP]:
        //     (state) =>
        //         update(state, {currentStep: {$set: state.currentStep - 1}})
    }, defaultState
);
