import {OrderSide} from '@nexex/types';
import {MarketConfig, OrderSlim} from '@nexex/types/orderbook';
import BigNumber from 'bignumber.js';
import update from 'immutability-helper';
import mergeSorted from 'merge-k-sorted-arrays';
import * as R from 'ramda';
import {handleActions} from 'redux-actions';
import {AmountUnit} from '../../constants';
import {FtOrderAggregate} from '../../types';
import {Amount} from '../../utils/Amount';
import {askComparator, bidComparator} from '../../utils/DexOrderUtil';
import {
    LoadConfigAction,
    MergeAgOrderAction,
    MergeOrderAction,
    MergeOrdersAction,
    OrderBookActionType,
    RemoveOrderAction,
    UpdateOrderVolumeAction
} from '../actions/orderbook.action';

export interface OrderbookState {
    bids: FtOrderAggregate[];
    asks: FtOrderAggregate[];
    decimals: number;
    configs: {[marketId: string]: MarketConfig};
}

const defaultState: OrderbookState = {
    bids: [],
    asks: [],
    decimals: 5,
    configs: {}
};

export default handleActions<OrderbookState, any>(
    {
        [OrderBookActionType.CLEAR]: state =>
            update(state, {$merge: defaultState}),
        [OrderBookActionType.ORDERS_MERGED]: (
            state,
            {payload: {side, orders}}: MergeOrdersAction
        ) => {
            if (side === OrderSide.BID) {
                return update(state, {
                    bids: {
                        $set: R.uniqWith<FtOrderAggregate,
                            {}>((x, y) => x.price.eq(y.price))(
                            mergeSorted([orders, state.bids], {
                                comparator: bidComparator
                            })
                        )
                    }
                });
            } else {
                return update(state, {
                    asks: {
                        $set: R.uniqWith<FtOrderAggregate,
                            {}>((x, y) => x.price.eq(y.price))(
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
        [OrderBookActionType.ORDER_AG_MERGE]: (state, {payload: order}: MergeAgOrderAction) => {
            if (order.side === OrderSide.BID) {
                return update(state, {
                    bids: {
                        $set: R.uniqWith<FtOrderAggregate,
                            {}>((x, y) => x.price.eq(y.price))(
                            mergeSorted([[order], state.bids], {
                                comparator: bidComparator
                            })
                        )
                    }
                });
            } else {
                return update(state, {
                    asks: {
                        $set: R.uniqWith<FtOrderAggregate,
                            {}>((x, y) => x.price.eq(y.price))(
                            mergeSorted([[order], state.asks], {
                                comparator: askComparator
                            })
                        )
                    }
                });
            }
        },
        [OrderBookActionType.ORDER_MERGE]: (state, {payload: order}: MergeOrderAction) => {
            const orders = order.side === OrderSide.BID ? state.bids : state.asks;
            const slim: OrderSlim = {
                orderHash: order.orderHash,
                remainingBaseTokenAmount: order.remainingBaseTokenAmount.toWei(),
                remainingQuoteTokenAmount: order.remainingQuoteTokenAmount.toWei()
            };
            return update(state, {
                [order.side === OrderSide.BID ? 'bids' : 'asks']: {
                    $set: orders.map(o => {
                        if (o.price.eq(order.price.decimalPlaces(state.decimals))) {
                            const newSlimOrders = R.compose(R.uniqBy(R.prop('orderHash')), R.prepend<OrderSlim>(slim))(o.orders);
                            const [aggregateBaseTokenAmount, aggregateQuoteTokenAmount] =
                                newSlimOrders.reduce(([acc1, acc2], order) =>
                                        [acc1.plus(order.remainingBaseTokenAmount), acc2.plus(order.remainingQuoteTokenAmount)]
                                    , [new BigNumber(0), new BigNumber(0)]);
                            return {
                                remainingBaseTokenAmount: new Amount(aggregateBaseTokenAmount, AmountUnit.WEI, o.baseToken.decimals),
                                remainingQuoteTokenAmount: new Amount(aggregateQuoteTokenAmount, AmountUnit.WEI, o.baseToken.decimals),
                                price: o.price,
                                side: o.side,
                                orders: newSlimOrders,
                                baseToken: o.baseToken,
                                quoteToken: o.quoteToken
                            }
                        } else {
                            return o;
                        }
                    })
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
            const {orderSide, orderHash, quoteAmount, baseAmount} = payload;
            const side = orderSide === OrderSide.ASK ? 'asks' : 'bids';
            const orders = state[side];
            return update(state, {
                [side]: {
                    $set: orders.map(o => {
                        const order = o.orders.find(item => item.orderHash === orderHash);

                        if (order) {
                            order.remainingBaseTokenAmount = new BigNumber(baseAmount);
                            order.remainingQuoteTokenAmount = new BigNumber(quoteAmount);
                            const [aggregateBaseTokenAmount, aggregateQuoteTokenAmount] =
                                o.orders.reduce(([acc1, acc2], order) =>
                                        [acc1.plus(order.remainingBaseTokenAmount), acc2.plus(order.remainingQuoteTokenAmount)]
                                    , [new BigNumber(0), new BigNumber(0)]);
                            return {
                                remainingBaseTokenAmount: new Amount(aggregateBaseTokenAmount, AmountUnit.WEI, o.baseToken.decimals),
                                remainingQuoteTokenAmount: new Amount(aggregateQuoteTokenAmount, AmountUnit.WEI, o.baseToken.decimals),
                                price: o.price,
                                side: o.side,
                                orders: o.orders,
                                baseToken: o.baseToken,
                                quoteToken: o.quoteToken
                            }
                        } else {
                            return o;
                        }
                    })
                }
            });
        },
        [OrderBookActionType.ORDER_REMOVE]: (state, {payload}: RemoveOrderAction) => {
            const {orderSide, orderHash} = payload;
            const side = orderSide === OrderSide.ASK ? 'asks' : 'bids';
            const orders = state[side];
            return update(state, {
                [side]: {
                    $set: orders.reduce( (acc, o) => {
                        const idx = o.orders.findIndex(item => item.orderHash === orderHash);
                        if (idx >= 0) {
                            o.orders.splice(idx, 1);
                            if (o.orders.length > 0) {
                                const [aggregateBaseTokenAmount, aggregateQuoteTokenAmount] =
                                    o.orders.reduce(([acc1, acc2], order) =>
                                            [acc1.plus(order.remainingBaseTokenAmount), acc2.plus(order.remainingQuoteTokenAmount)]
                                        , [new BigNumber(0), new BigNumber(0)]);
                                acc.push({
                                    remainingBaseTokenAmount: new Amount(aggregateBaseTokenAmount, AmountUnit.WEI, o.baseToken.decimals),
                                    remainingQuoteTokenAmount: new Amount(aggregateQuoteTokenAmount, AmountUnit.WEI, o.baseToken.decimals),
                                    price: o.price,
                                    side: o.side,
                                    orders: o.orders,
                                    baseToken: o.baseToken,
                                    quoteToken: o.quoteToken
                                });
                            }
                        } else {
                            acc.push(o);
                        }
                        return acc;
                    }, [])
                }
            });
        }
    },
    defaultState
);
