import {handleActions} from 'redux-actions';

interface BalanceWidgetState {
    baseTokenEnableSpin: boolean;
    quoteTokenEnableSpin: boolean;
}

const defaultState: BalanceWidgetState = {
    baseTokenEnableSpin: false,
    quoteTokenEnableSpin: false
};

export default handleActions<BalanceWidgetState, any>(
    {
        // [NewOrderPanelActionType.FORM_FIELD_UPDATE]:
        //     (state, action: UpdateFormFieldAction) => {
        //         if (action.payload.side === OrderSide.SELL) {
        //             return update(state, {formDataForSell: {$merge: action.payload.formData}});
        //         } else {
        //             return update(state, {formDataForBuy: {$merge: action.payload.formData}});
        //         }
        //     }

    }, defaultState
);
