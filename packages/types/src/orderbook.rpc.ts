import {OrderbookOrder, OrderSide, PlainDexOrder} from './index';
import {DownstreamPayload, Market, MarketConfig, OrderAggregate, OrderbookAggregate} from './orderbook';


export enum WsRequests {
    MARKET_SNAPSHOT = 'market_snapshot',
    MARKET_TOP_ORDERS = 'market_top',
    MARKET_AG_BY_PRICE = 'market_ag_by_price',
    MARKET_ORDER_BATCH = 'market_order_batch',
    MARKET_QUERY = 'market_query',
    MARKET_ORDER = 'market_order',
    MARKET_CONFIG = 'market_config',
    ORDER_PLACE = 'order_place'
}

export interface WsRpcRequest {
    method: string;
    params: any[];
    id?: string | number;
}

export interface MarketSnapshotReq extends WsRpcRequest {
    method: WsRequests.MARKET_SNAPSHOT;
    //marketId, limit
    params: [string, number];
}

export interface MarketSnapshotRsp extends DownstreamPayload {
    type: WsRequests.MARKET_SNAPSHOT;
    payload: {asks: any[]; bids: any[]};
}

export interface MarketTopOrdersReq extends WsRpcRequest {
    method: WsRequests.MARKET_TOP_ORDERS;
    //marketId, limit, decimals
    params: [string, number, number];
}

export interface MarketTopOrdersRsp extends DownstreamPayload {
    type: WsRequests.MARKET_TOP_ORDERS;
    payload: OrderbookAggregate;
}

export interface MarketOrderAgByPriceReq extends WsRpcRequest {
    method: WsRequests.MARKET_AG_BY_PRICE;
    //marketId, side, price
    params: [string, OrderSide, string];
}

export interface MarketOrderAgByPriceRsp extends DownstreamPayload {
    type: WsRequests.MARKET_AG_BY_PRICE;
    payload: OrderAggregate;
}

export interface MarketQueryReq extends WsRpcRequest {
    method: WsRequests.MARKET_QUERY;
    params: [];
}

export interface MarketQueryRsp extends DownstreamPayload {
    type: WsRequests.MARKET_QUERY;
    payload: Market[];
}

export interface MarketOrderReq extends WsRpcRequest {
    method: WsRequests.MARKET_ORDER;
    // order hash
    params: [string];
}

export interface MarketOrderRsp extends DownstreamPayload {
    type: WsRequests.MARKET_ORDER;
    payload: OrderbookOrder;
}

export interface MarketConfigReq extends WsRpcRequest {
    method: WsRequests.MARKET_CONFIG;
    // marketId
    params: [string];
}

export interface MarketConfigRsp extends DownstreamPayload {
    type: WsRequests.MARKET_CONFIG;
    payload: MarketConfig;
}

export interface OrderPlaceReq extends WsRpcRequest {
    method: WsRequests.ORDER_PLACE;
    // marketId
    params: [PlainDexOrder];
}

export interface OrderPlaceRsp extends DownstreamPayload {
    type: WsRequests.ORDER_PLACE;
    payload: {
        success: boolean;
        error?: string;
    }
}

export interface MarketOrderBatchReq extends WsRpcRequest {
    method: WsRequests.MARKET_ORDER_BATCH;
    // marketId, side, orderHashs
    params: [string, OrderSide, string[]];
}

export interface MarketOrderBatchRsp extends DownstreamPayload {
    type: WsRequests.MARKET_ORDER_BATCH;
    payload: PlainDexOrder[];
}
