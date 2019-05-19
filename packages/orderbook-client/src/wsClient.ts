import {PlainDexOrder} from '@nexex/types/index';
import {
    DownstreamPayload,
    Market,
    MarketConfig,
    MarketConfigReq,
    MarketConfigRsp,
    MarketOrderReq,
    MarketOrderRsp,
    MarketQueryReq,
    MarketQueryRsp,
    MarketSnapshotReq,
    MarketSnapshotRsp,
    NewOrderAcceptedEvent,
    ObEventTypes,
    Orderbook,
    OrderbookOrder,
    OrderbookSlim,
    OrderPlaceReq,
    OrderPlaceRsp,
    WsRequests
} from '@nexex/types/orderbook';
import {OrderbookOrderTpl, OrderbookTpl} from '@nexex/types/tpl/orderbook';
import {Deserialize} from 'cerialize';
import {Subject} from 'rxjs';
import {filter, first, map} from 'rxjs/operators';
import SocketIO from 'socket.io-client';
import {OrderbookWsClientConfig} from './';
import Socket = SocketIOClient.Socket;

let reqId = 0;

type PlaceOrderResult = {
    success: boolean;
    error?: string;
};

export class OrderbookWsClient {
    socket: Socket;
    events$: Subject<DownstreamPayload>;

    private config: OrderbookWsClientConfig;
    private lastSub: {baseTokenAddr: string; quoteTokenAddr: string};

    constructor(config: OrderbookWsClientConfig) {
        this.config = config;
        this.socket = SocketIO(config.url);
        this.events$ = new Subject<DownstreamPayload>();
        this.socket.on('orderbook', event => this.events$.next(this.parse(event)));
        this.socket.on('reconnect', () => this.socket.emit('subscribe', this.lastSub));
    }

    /**
     * internally will subscribe two order sequence from ob service
     * @param baseTokenAddr
     * @param quoteTokenAddr
     * @return subscribeId
     * @throws error if not connected
     */
    subscribe(baseTokenAddr, quoteTokenAddr): void {
        this.lastSub = {baseTokenAddr: baseTokenAddr.toLowerCase(), quoteTokenAddr: quoteTokenAddr.toLowerCase()};
        this.socket.emit('subscribe', this.lastSub);
    }

    snapshot(marketId: string, limit: number = 5, minimal: boolean = true): Promise<Orderbook | OrderbookSlim> {
        const id = reqId++;
        this.socket.emit('rpc', {
            method: WsRequests.MARKET_SNAPSHOT,
            params: [marketId, limit, minimal],
            id
        } as MarketSnapshotReq);
        return this.events$.pipe(
            filter(evt => evt.id === id),
            first(),
            map( (rsp: MarketSnapshotRsp) => Deserialize(rsp.payload, OrderbookTpl))
        ).toPromise();
    }

    reqSnapshot(marketId: string, limit: number = 5, minimal: boolean = true) {
        this.socket.emit('rpc', {
            method: WsRequests.MARKET_SNAPSHOT,
            params: [marketId, limit, minimal]
        } as MarketSnapshotReq);
    }

    async markets(): Promise<Market[]> {
        const id = reqId++;
        this.socket.emit('rpc', {
            method: WsRequests.MARKET_QUERY,
            params: [],
            id
        } as MarketQueryReq);
        return this.events$.pipe(
            filter(evt => evt.id === id),
            first(),
            map( (rsp: MarketQueryRsp) => rsp.payload)
        ).toPromise();
    }

    async queryOrder(orderHash: string): Promise<OrderbookOrder> {
        const id = reqId++;
        this.socket.emit('rpc', {
            method: WsRequests.MARKET_ORDER,
            params: [orderHash],
            id
        } as MarketOrderReq);
        return this.events$.pipe(
            filter(evt => evt.id === id),
            first(),
            map( (rsp: MarketOrderRsp) => Deserialize(rsp.payload, OrderbookOrderTpl))
        ).toPromise();
    }

    async marketConfig(marketId: string): Promise<MarketConfig> {
        const id = reqId++;
        this.socket.emit('rpc', {
            method: WsRequests.MARKET_CONFIG,
            params: [marketId],
            id
        } as MarketConfigReq);
        return this.events$.pipe(
            filter(evt => evt.id === id),
            first(),
            map( (rsp: MarketConfigRsp) => rsp.payload)
        ).toPromise();
    }

    async placeOrder(orderHash: string, order: PlainDexOrder): Promise<PlaceOrderResult> {
        const id = reqId++;
        this.socket.emit('rpc', {
            method: WsRequests.ORDER_PLACE,
            params: [order],
            id
        } as OrderPlaceReq);
        // return this.events$.pipe(
        //     filter(evt => evt.type === ObEventTypes.NEW_ORDER_ACCEPTED && evt.payload.order.orderHash === orderHash),
        //     first(),
        //     map( () => true)
        // ).toPromise();
        return this.events$.pipe(
            filter(evt => evt.id === id),
            first(),
            map( (rsp: OrderPlaceRsp) => rsp.payload)
        ).toPromise();
    }

    private parse(event) {
        if (event.type === ObEventTypes.NEW_ORDER_ACCEPTED) {
            const {payload} = event as NewOrderAcceptedEvent;
            const order = Deserialize(payload.order, OrderbookOrderTpl);
            return {
                type: event.type,
                payload: {
                    marketId: payload.marketId,
                    order
                }
            };
        }
        return event;
    }

    // public unsubscribe(subscribeId: string): void {}
}
