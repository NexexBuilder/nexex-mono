import {OrderSide} from '@nexex/types';
import {MarketConfig} from '@nexex/types/orderbook';
import update from 'immutability-helper';
import mergeSorted from 'merge-k-sorted-arrays';
import * as R from 'ramda';
import {handleActions} from 'redux-actions';
import {AmountUnit} from '../../constants';
import {FtOrder} from '../../types';
import {Amount} from '../../utils/Amount';
import {askComparator, bidComparator} from '../../utils/DexOrderUtil';
import {
    LoadConfigAction,
    MergeOrdersAction,
    OrderBookActionType, RemoveOrderAction,
    UpdateOrderVolumeAction
} from '../actions/orderbook.action';

export interface OrderbookState {
    bids: FtOrder[];
    asks: FtOrder[];
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
                            FtOrder,
                            string
                        >(R.prop('orderHash'))(
                            mergeSorted([orders, state.bids], {
                                comparator: bidComparator
                            })
                        )
                    }
                });
            } else {
                return update(state, {
                    asks: {
                        $set: R.uniqBy<
                            FtOrder,
                            string
                        >(R.prop('orderHash'))(
                            mergeSorted([orders, state.asks], {
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
        },
        /**
         * marketId: string;
         orderSide: OrderSide;
         orderHash: string;
         baseAmount: string;
         quoteAmount: string;
         lastUpdate: Date;
         */
        [OrderBookActionType.VOLUME_UPDATE]: (state, {payload}: UpdateOrderVolumeAction) => {
            const side = payload.orderSide === OrderSide.ASK ? 'asks' : 'bids';
            return update(state, {
                [side]: {
                    $set: R.map((order: FtOrder)=>{
                        if(order.orderHash === payload.orderHash) {
                            order.remainingBaseTokenAmount = new Amount(payload.baseAmount, AmountUnit.WEI, order.baseToken.decimals);
                            order.remainingQuoteTokenAmount = new Amount(payload.quoteAmount, AmountUnit.WEI, order.quoteToken.decimals);
                            order.lastUpdate = payload.lastUpdate;
                        }
                        return order;
                    })(state[side])
                }
            });
        },
        [OrderBookActionType.ORDER_REMOVE]: (state, {payload}: RemoveOrderAction) => {
            const {orderSide, orderHash} = payload;
            const side = orderSide === OrderSide.ASK ? 'asks' : 'bids';
            return update(state, {
                [side]: {
                    $set: R.filter((order: FtOrder)=> order.orderHash !== orderHash)(state[side])
                }
            });
        }
    },
    defaultState
);
