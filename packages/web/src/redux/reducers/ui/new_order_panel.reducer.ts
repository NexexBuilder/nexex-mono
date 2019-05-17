import BigNumber from 'bignumber.js';
import {OrderSide} from '@nexex/types';
import update from 'immutability-helper';
import {handleActions} from 'redux-actions';
import {Amount} from '../../../utils/Amount';
import {
    NewOrderPanelActionType,
    UpdateFormFieldAction
} from '../../actions/ui/new_order_panel.action';

export type NewOrderPanelForm = {
    price?: BigNumber;
    amount?: Amount;
};

interface NewOrderPanelState {
    formDataForSell: NewOrderPanelForm;
    formDataForBuy: NewOrderPanelForm;
}

const defaultState: NewOrderPanelState = {
    formDataForSell: {},
    formDataForBuy: {}
};

export default handleActions<NewOrderPanelState, any>(
    {
        [NewOrderPanelActionType.FORM_FIELD_UPDATE]: (
            state,
            action: UpdateFormFieldAction
        ) => {
            if (action.payload.side === OrderSide.ASK) {
                return update(state, {
                    formDataForSell: {$merge: action.payload.formData}
                });
            } else {
                return update(state, {
                    formDataForBuy: {$merge: action.payload.formData}
                });
            }
        }
    },
    defaultState
);
