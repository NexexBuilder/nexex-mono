import {OrderSide} from '@nexex/types';
import {Market, MarketConfig, NewOrderAcceptedEvent, OrderDelistEvent, OrderUpdateEvent, OrderUpdatePayload} from '@nexex/types/orderbook';
import {createAction} from 'redux-actions';
import {FtOrder} from '../../types';

export const OrderBookActionType = {
    CLEAR: 'orderbook/CLEAR',
    OB_SNAPSHOT: 'orderbook/OB_SNAPSHOT',
    OB_SNAPSHOT_REQUEST: 'orderbook/OB_SNAPSHOT_REQUEST',
    OB_SNAPSHOT_ERROR: 'orderbook/OB_SNAPSHOT_ERROR',
    ORDER_MERGE: 'orderbook/ORDER/MERGE',
    ORDER_REMOVE: 'orderbook/ORDER/REMOVE',
    VOLUME_UPDATE: 'orderbook/VOLUME/UPDATE',
    ORDERS_MERGED: 'orderbook/ORDERS_MERGED',
    CONFIG_LOADED: 'orderbook/CONFIG_LOADED',
    CONFIG_REQUEST: 'orderbook/CONFIG_REQUEST',
    OB_DOWNSTREAM_EVENT: 'orderbook/OB_DOWNSTREAM_EVENT'
    // ZERO_OB_SUBSCRIBE: 'orderbook/ZERO_OB_SUBSCRIBE',
    // ZERO_OB_UPDATE: 'orderbook/ZERO_OB_UPDATE',
    // ZERO_OB_UPDATE_ERROR: 'orderbook/ZERO_OB_UPDATE_ERROR'
};

export const clearOrder = createAction(
    OrderBookActionType.CLEAR,
    (market: Market) => market
);
export type ClearOrderAction = ReturnType<typeof clearOrder>;

export const mergeOrders = createAction(
    OrderBookActionType.ORDERS_MERGED,
    (side: OrderSide, orders: FtOrder[]) => ({
        orders,
        side
    })
);
export type MergeOrdersAction = ReturnType<typeof mergeOrders>;

export const mergeOrder = createAction(
    OrderBookActionType.ORDER_MERGE,
    (order: FtOrder) => order
);
export type MergeOrderAction = ReturnType<typeof mergeOrder>;

export const removeOrder = createAction(
    OrderBookActionType.ORDER_REMOVE,
    (orderSide: OrderSide, orderHash: string) => ({orderSide, orderHash})
);
export type RemoveOrderAction = ReturnType<typeof removeOrder>;

export const updateOrderVolume = createAction(
    OrderBookActionType.VOLUME_UPDATE,
    (payload: OrderUpdatePayload) => payload
);
export type UpdateOrderVolumeAction = ReturnType<typeof updateOrderVolume>;

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

export const downstreamEvent = createAction(
    OrderBookActionType.OB_DOWNSTREAM_EVENT,
    (event: ObDownstreamEvent) => event
);
export type DownstreamAction = ReturnType<typeof downstreamEvent>;
export type ObDownstreamEvent = NewOrderAcceptedEvent | OrderUpdateEvent | OrderDelistEvent;
