import {OrderSide, OrderState, PlainDexOrder} from './';
import BigNumber from 'bignumber.js';

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
    PEER_EVENT = 'peer_event',
    ORDER_BALANCE_UPDATE = 'order_balance_update',
    ORDER_DELIST = 'order_delist',
    ORDER_UPDATE_TASK = 'order_update_task',
    IPFS_SUBSCRIPTION = 'ipfs_subscribe',
    IPFS_PUBLISH = 'ipfs_publish',
    IPFS_INCOMING = 'ipfs_income'
}

export type OrderbookEvent =
    | NewOrderOnboardEvent
    | NewOrderAcceptedEvent
    | OrderUpdateEvent
    | OrderDelistEvent
    | DownstreamEvent<any>
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

/** Downstream Events **/
export interface DownstreamEvent<T extends NewOrderAcceptedEvent | OrderUpdateEvent | OrderDelistEvent> {
    type: ObEventTypes.DOWNSTREAM_EVENT;
    payload: T;
    to: string;
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
