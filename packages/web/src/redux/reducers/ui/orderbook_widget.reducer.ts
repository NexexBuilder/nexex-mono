import update from 'immutability-helper';
import {handleActions} from 'redux-actions';
import {FtOrderAggregate} from '../../../types';
import {OrderBookWidgetActionType, SelectOrderAction} from '../../actions/ui/orderbook_widget.action';

export interface OrderbookWidgetState {
    selectedOrder?: FtOrderAggregate;
}

const defaultState: OrderbookWidgetState = {
};

export default handleActions<OrderbookWidgetState, any>(
    {
        [OrderBookWidgetActionType.ORDER_SELECT]:
            (state, action: SelectOrderAction) =>
                update(state, {selectedOrder: {$set: action.payload}})
        ,
        [OrderBookWidgetActionType.ORDER_DESELECT]:
            (state, action: SelectOrderAction) =>
                update(state, {$unset: ['selectedOrder']})
    }, defaultState
);
