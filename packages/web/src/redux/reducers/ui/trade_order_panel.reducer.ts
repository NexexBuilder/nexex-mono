import update from 'immutability-helper';
import {handleActions} from 'redux-actions';
import {Amount} from '../../../utils/Amount';
import {TradeOrderPanelActionType, UpdateFormDataAction} from '../../actions/ui/trade_order_panel.action';

export type TradeOrderPanelForm = {
    baseTokenAmount?: Amount;
    quoteTokenAmount?: Amount;
};

interface TradeOrderPanelState {
    formData: TradeOrderPanelForm;
}

const defaultState: TradeOrderPanelState = {
    formData: {}
};

export default handleActions<TradeOrderPanelState, any>(
    {
        [TradeOrderPanelActionType.FORM_DATA_UPDATE]:
            (state, action: UpdateFormDataAction) => {
                return update(state, {formData: {$set: action.payload}});
            }

    }, defaultState
);
