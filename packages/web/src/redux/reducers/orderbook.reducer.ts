import {OrderbookOrder, OrderSide} from '@nexex/types';
import {MarketConfig} from '@nexex/types/orderbook';
import update from 'immutability-helper';
import mergeSorted from 'merge-k-sorted-arrays';
import * as R from 'ramda';
import {handleActions} from 'redux-actions';
import {askComparator, bidComparator} from '../../utils/DexOrderUtil';
import {
    LoadConfigAction,
    MergeOrdersAction,
    OrderBookActionType
} from '../actions/orderbook.action';

export interface OrderbookState {
    bids: OrderbookOrder[];
    asks: OrderbookOrder[];
    configs: {[marketId: string]: MarketConfig};
}

const defaultState: OrderbookState = {
    bids: [],
    asks: [],
    configs: {}
};

export default handleActions<OrderbookState, any>(
    {
        [OrderBookActionType.CLEAR]: state =>
            update(state, {$set: defaultState}),
        [OrderBookActionType.ORDERS_MERGED]: (
            state,
            {payload: {side, orders}}: MergeOrdersAction
        ) => {
            if (side === OrderSide.BID) {
                return update(state, {
                    bids: {
                        $set: R.uniqBy<
                            OrderbookOrder,
                            string
                        >(R.prop('orderHash'))(
                            mergeSorted([state.bids, orders], {
                                comparator: bidComparator
                            })
                        )
                    }
                });
            } else {
                return update(state, {
                    asks: {
                        $set: R.uniqBy<
                            OrderbookOrder,
                            string
                        >(R.prop('orderHash'))(
                            mergeSorted([state.asks, orders], {
                                comparator: askComparator
                            })
                        )
                    }
                });
            }
        },
        [OrderBookActionType.CONFIG_LOADED]: (state, {payload: {marketId, config}}: LoadConfigAction) => {
            return update(state, {
                configs: {
                    $merge: {[marketId]: config}
                }
            });
        }
    },
    defaultState
);
