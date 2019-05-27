import update from 'immutability-helper';
import {handleActions} from 'redux-actions';
import {Amount} from '../../../utils/Amount';
import {
    TradeOrderPanelActionType,
    UpdateFormDataAction,
    UpdateFormAmountAction
} from '../../actions/ui/trade_order_panel.action';

export type TradeOrderPanelForm = {
    baseTokenAmount?: Amount;
    quoteTokenAmount?: Amount;
    isDirty: boolean;
};

export interface TradeOrderPanelState {
    formData: TradeOrderPanelForm;
}

const defaultState: TradeOrderPanelState = {
    formData: {
        isDirty: false
    }
};

export default handleActions<TradeOrderPanelState, any>(
    {
        [TradeOrderPanelActionType.FORM_DATA_UPDATE]:
            (state, action: UpdateFormDataAction) => {
                return update(state, {formData: {$set: action.payload}});
            },
        // [TradeOrderPanelActionType.FORM_AMOUNT_UPDATE]:
        //     (state, action: UpdateFormAmountAction) => {
        //         return update(state, {formData: {$merge: action.payload.formData, isDirty: {$set: true}}});
        //     },
    }, defaultState
);
