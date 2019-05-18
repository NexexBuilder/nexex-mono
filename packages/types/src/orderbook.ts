import BigNumber from 'bignumber.js';
import {ERC20Token, OrderSide, OrderState, PlainDexOrder} from './';

export enum EventSource {
    SELF,
    PEER,
    TASK_NODE,
    IPFS
}

export interface OrderbookOrder {
    orderHash: string;
    side: OrderSide;
    state: OrderState;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    remainingBaseTokenAmount?: BigNumber;
    remainingQuoteTokenAmount?: BigNumber;
    lastUpdate?: Date;
    price: BigNumber;
    createdDate: Date;
    signedOrder: PlainDexOrder;
}

export enum ObEventTypes {
    NEW_ORDER_ONBOARD = 'new_order_onboard',
    NEW_ORDER_ACCEPTED = 'new_order_accepted',
    DOWNSTREAM_EVENT = 'downstream_event',
    WS_UPSTREAM_EVENT = 'ws_upstream_event',
    PEER_EVENT = 'peer_event',
    ORDER_BALANCE_UPDATE = 'order_balance_update',
    ORDER_DELIST = 'order_delist',
    ORDER_UPDATE_TASK = 'order_update_task',
    IPFS_SUBSCRIPTION = 'ipfs_subscribe',
    IPFS_PUBLISH = 'ipfs_publish',
    IPFS_INCOMING = 'ipfs_income'
}

export enum WsRequests {
    MARKET_SNAPSHOT = 'market_snapshot',
    MARKET_QUERY = 'market_query',
    MARKET_ORDER = 'market_order'
}

export type OrderbookEvent =
    | NewOrderOnboardEvent
    | NewOrderAcceptedEvent
    | OrderUpdateEvent
    | OrderDelistEvent
    | DownstreamEvent
    | WsUpstreamEvent
    | PeerEvent<any>
    | UpdateOrderTask
    | IpfsIncomingEvent
    | IpfsPublishEvent
    | IpfsSubscriptionEvent;

// export interface MarketSubscriptionPayload {
//     market: {baseTokenAddr: string; quoteTokenAddr: string};
//     clientId: string;
// }

/**  Internal Events **/

/**
 * when node receive user's order from frontend
 * validate the order and persist it into db
 * => NewOrderAcceptedEvent when success
 * => PeerEvent to notify peers
 */
export interface NewOrderOnboardEvent {
    type: ObEventTypes.NEW_ORDER_ONBOARD;
    payload: OrderbookOrder;
    source: EventSource;
}

/**
 * notify ws clients
 */
export interface NewOrderAcceptedEvent {
    type: ObEventTypes.NEW_ORDER_ACCEPTED;
    payload: NewOrderAcceptedPayload;
    source: EventSource;
}

export interface NewOrderAcceptedPayload {
    order: OrderbookOrder;
    marketId: string;
}

export interface OrderUpdatePayload {
    marketId: string;
    orderSide: OrderSide;
    orderHash: string;
    baseAmount: string;
    quoteAmount: string;
    lastUpdate: Date;
}

export interface OrderUpdateEvent {
    type: ObEventTypes.ORDER_BALANCE_UPDATE;
    payload: OrderUpdatePayload;
    source: EventSource;
}

export interface OrderDelistEvent {
    type: ObEventTypes.ORDER_DELIST;
    payload: OrderUpdatePayload;
    source: EventSource;
}

export interface PeerEvent<T extends NewOrderAcceptedEvent | OrderUpdateEvent | OrderDelistEvent> {
    type: ObEventTypes.PEER_EVENT;
    payload: T;
}

/**  Upstream Events **/
/**
 * when receive user's order from peer
 * add it to in-memory orderbook
 * => NewOrderAcceptedEvent
 */
// export interface NewOrderFromPeerEvent {
//     type: ObEventTypes.NEW_ORDER_FROM_PEER;
//     payload: NewOrderAcceptedPayload;
// }

export interface UpdateOrderTask {
    type: ObEventTypes.ORDER_UPDATE_TASK;
    payload: OrderbookOrder;
    source: EventSource;
}

/** Ws Events **/
export interface DownstreamEvent {
    type: ObEventTypes.DOWNSTREAM_EVENT;
    payload: DownstreamPayload;
    to: string;
}

export interface DownstreamPayload {
    type: string;
    payload: any;
    id?: string | number;
}

export interface WsUpstreamEvent {
    type: ObEventTypes.WS_UPSTREAM_EVENT;
    payload: WsRpcRequest;
    from: string;
}

export interface WsRpcRequest {
    method: string;
    params: any[];
    id?: string | number;
}

export interface MarketSnapshotReq extends WsRpcRequest {
    method: WsRequests.MARKET_SNAPSHOT;
    //marketId, limit, minimal
    params: [string, number, boolean];
}

export interface MarketSnapshotRsp extends DownstreamPayload{
    type: WsRequests.MARKET_SNAPSHOT;
    payload: {asks: any[]; bids: any[]};
}

export interface MarketQueryReq extends WsRpcRequest {
    method: WsRequests.MARKET_QUERY;
    params: [];
}

export interface MarketQueryRsp extends DownstreamPayload{
    type: WsRequests.MARKET_QUERY;
    payload: Market[];
}

export interface MarketOrderReq extends WsRpcRequest {
    method: WsRequests.MARKET_ORDER;
    // order hash
    params: [string];
}

export interface MarketOrderRsp extends DownstreamPayload{
    type: WsRequests.MARKET_ORDER;
    payload: OrderbookOrder;
}

/** Ipfs Events **/
export interface IpfsSubscriptionEvent {
    type: ObEventTypes.IPFS_SUBSCRIPTION;
    payload: {
        marketId: string;
    };
}

export interface IpfsPublishPayload {
    marketId: string;
    order: PlainDexOrder;
}

export interface IpfsPublishEvent {
    type: ObEventTypes.IPFS_PUBLISH;
    payload: IpfsPublishPayload;
}

export interface IpfsIncomingEvent {
    type: ObEventTypes.IPFS_INCOMING;
    payload: PlainDexOrder;
}

export interface Market {
    marketId: string;
    base: ERC20Token;
    quote: ERC20Token;
}

export interface MarketConfig {
    minOrderBaseVolume: string;
    minOrderQuoteVolume: string;
    makerFeeRecipient: string;
    minMakerFeeRate: string;
}

export interface Orderbook {
    bids: OrderbookOrder[];
    asks: OrderbookOrder[];
}

export interface OrderSlim {
    orderHash: string;
    remainingBaseTokenAmount: string;
    remainingQuoteTokenAmount: string;
    price: string;
}

export interface OrderbookSlim {
    bids: OrderSlim[];
    asks: OrderSlim[];
}
