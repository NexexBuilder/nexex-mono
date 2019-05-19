import {
    OrderSide
} from '@nexex/types';
import {Market, MarketConfig} from '@nexex/types/orderbook';
import {createAction} from 'redux-actions';
import {FtOrder} from '../../types';

export const OrderBookActionType = {
    CLEAR: 'orderbook/CLEAR',
    OB_SNAPSHOT: 'orderbook/OB_SNAPSHOT',
    OB_SNAPSHOT_REQUEST: 'orderbook/OB_SNAPSHOT_REQUEST',
    OB_SNAPSHOT_ERROR: 'orderbook/OB_SNAPSHOT_ERROR',
    ORDER_ADDED: 'orderbook/ORDER_ADDED',
    ORDERS_MERGED: 'orderbook/ORDERS_MERGED',
    CONFIG_LOADED: 'orderbook/CONFIG_LOADED',
    CONFIG_REQUEST: 'orderbook/CONFIG_REQUEST',
    // ZERO_OB_SUBSCRIBE: 'orderbook/ZERO_OB_SUBSCRIBE',
    // ZERO_OB_UPDATE: 'orderbook/ZERO_OB_UPDATE',
    // ZERO_OB_UPDATE_ERROR: 'orderbook/ZERO_OB_UPDATE_ERROR'
};

export const clearOrder = createAction(
    OrderBookActionType.CLEAR,
    (market: Market) => market
);
export type ClearOrderAction = ReturnType<typeof clearOrder>;

export const mergeUnionOrders = createAction(
    OrderBookActionType.ORDERS_MERGED,
    (side: OrderSide, orders: FtOrder[]) => ({
        orders,
        side
    })
);
export type MergeOrdersAction = ReturnType<typeof mergeUnionOrders>;

export const requestOBSnapshot = createAction(
    OrderBookActionType.OB_SNAPSHOT_REQUEST,
    (market: Market) => market
);
export type RequestOrderBookAction = ReturnType<typeof requestOBSnapshot>;

export const requestConfig = createAction(
    OrderBookActionType.CONFIG_REQUEST,
    (marketId: string) => marketId
);
export type RequestConfigAction = ReturnType<typeof requestConfig>;

export const loadConfig = createAction(
    OrderBookActionType.CONFIG_LOADED,
    (marketId: string, config: MarketConfig) => ({marketId, config})
);
export type LoadConfigAction = ReturnType<typeof loadConfig>;
