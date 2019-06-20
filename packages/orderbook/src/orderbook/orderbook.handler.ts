import {Inject, Injectable} from '@nestjs/common';
import {ObConfig} from '@nexex/orderbook/global/global.model';
import {
    NewOrderAcceptedEvent,
    NewOrderAcceptedPayload,
    NewOrderOnboardEvent,
    ObEventTypes,
    OrderbookEvent
} from '@nexex/types';
import {
    EventSource,
    MarketConfigReq,
    MarketOrderAgByPriceReq,
    MarketOrderBatchReq,
    MarketSnapshotReq,
    MarketTopOrdersReq,
    OrderDelistEvent,
    OrderPlaceReq,
    OrderUpdateEvent,
    OrderUpdatePayload,
    WsRequests,
    WsUpstreamEvent
} from '@nexex/types/orderbook';
import {OrderAggregateTpl, OrderbookAggregateTpl, OrderbookTpl} from '@nexex/types/tpl/orderbook';
import BigNumber from 'bignumber.js';
import {Serialize} from 'cerialize';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {EventsModule} from '../events/events.module';
import logger from '../logger';
import {OrderService} from '../order/order.service';
import {OrderbookService} from './orderbook.service';

@Injectable()
export class ObNewOrderHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderbookService: OrderbookService,
        private orderService: OrderService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.NEW_ORDER_ONBOARD))
            .subscribe((event: NewOrderOnboardEvent) => this.handle(event));
    }

    async handle(inputEvent: NewOrderOnboardEvent): Promise<void> {
        await this.orderbookService.whenReady();
        const {payload, source} = inputEvent;
        logger.debug('observice add order');
        if (await this.orderService.orderExists(payload)) {
            logger.warn(`order already exists ${payload.orderHash}`);
            return;
        }
        try {
            const marketId = this.orderbookService.addOrder(payload);
            const event: NewOrderAcceptedEvent = {
                type: ObEventTypes.NEW_ORDER_ACCEPTED,
                payload: {
                    order: payload,
                    marketId
                },
                source: EventSource.SELF
            };
            await this.orderService.insertOrder(payload);
            this.events$.next(event);
            this.events$.next({
                type: ObEventTypes.PEER_EVENT,
                payload: {
                    ...event,
                    source: EventSource.PEER
                }
            });
            if (source === EventSource.SELF) {
                this.events$.next({
                    type: ObEventTypes.IPFS_PUBLISH,
                    payload: {
                        marketId,
                        order: payload.signedOrder
                    }
                });
            }
        } catch (e) {
            logger.error('failed to add order', payload);
            logger.error(e);
        }
    }
}

@Injectable()
export class NewOrderFromPeerHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderbookService: OrderbookService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.NEW_ORDER_ACCEPTED && event.source === EventSource.PEER))
            .subscribe((event: NewOrderAcceptedEvent) => this.handle(event.payload));
    }

    async handle(payload: NewOrderAcceptedPayload): Promise<void> {
        await this.orderbookService.whenReady();
        logger.debug('observice add order');
        try {
            const {order} = payload;
            this.orderbookService.addOrder(order);
        } catch (e) {
            logger.error('failed to add order', payload);
            logger.error(e);
        }
    }
}

@Injectable()
export class OrderUpdateHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderbookService: OrderbookService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.ORDER_BALANCE_UPDATE))
            .subscribe((event: OrderUpdateEvent) => this.handle(event.payload));
    }

    async handle(payload: OrderUpdatePayload): Promise<void> {
        await this.orderbookService.whenReady();
        try {
            const {marketId, orderHash, orderSide, baseAmount, quoteAmount, lastUpdate} = payload;
            this.orderbookService.updateBalance(
                marketId,
                orderHash,
                orderSide,
                new BigNumber(baseAmount),
                new BigNumber(quoteAmount),
                lastUpdate
            );
        } catch (e) {
            logger.error('failed to update order', payload);
            logger.error(e);
        }
    }
}

@Injectable()
export class OrderDelistHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderbookService: OrderbookService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.ORDER_DELIST))
            .subscribe((event: OrderDelistEvent) => this.handle(event));
    }

    async handle(event: OrderDelistEvent): Promise<void> {
        await this.orderbookService.whenReady();
        logger.debug('observice delist order');
        try {
            const {marketId, orderHash, orderSide} = event.payload;
            this.orderbookService.delistOrder(marketId, orderHash, orderSide);
        } catch (e) {
            logger.error('failed to remove order');
            logger.error(e);
        }
        this.events$.next({
            type: ObEventTypes.DOWNSTREAM_EVENT,
            payload: event,
            to: event.payload.marketId
        })
    }
}

@Injectable()
export class WsOrderSnapshotHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderbookService: OrderbookService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.WS_UPSTREAM_EVENT && event.payload.method === WsRequests.MARKET_SNAPSHOT))
            .subscribe((event: WsUpstreamEvent) => this.handle(event));
    }

    async handle(event: WsUpstreamEvent): Promise<void> {
        await this.orderbookService.whenReady();
        const [marketId, limit] = (event.payload as MarketSnapshotReq).params;
        const snapshot = await this.orderbookService.getSnapshot(marketId, limit, false);
        this.events$.next({
            type: ObEventTypes.DOWNSTREAM_EVENT,
            to: event.from,
            payload: {
                type: WsRequests.MARKET_SNAPSHOT,
                payload: Serialize(snapshot, OrderbookTpl),
                id: event.payload.id,
            }
        });
    }
}

@Injectable()
export class WsTopOrderHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderbookService: OrderbookService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.WS_UPSTREAM_EVENT && event.payload.method === WsRequests.MARKET_TOP_ORDERS))
            .subscribe((event: WsUpstreamEvent) => this.handle(event));
    }

    async handle(event: WsUpstreamEvent): Promise<void> {
        await this.orderbookService.whenReady();
        const [marketId, limit, decimals] = (event.payload as MarketTopOrdersReq).params;
        const topOrders = await this.orderbookService.topOrders(marketId, limit, decimals);
        this.events$.next({
            type: ObEventTypes.DOWNSTREAM_EVENT,
            to: event.from,
            payload: {
                type: WsRequests.MARKET_TOP_ORDERS,
                payload: Serialize(topOrders, OrderbookAggregateTpl),
                id: event.payload.id,
            }
        });
    }
}

@Injectable()
export class WsOrderAgQueryHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderbookService: OrderbookService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.WS_UPSTREAM_EVENT && event.payload.method === WsRequests.MARKET_AG_BY_PRICE))
            .subscribe((event: WsUpstreamEvent) => this.handle(event));
    }

    async handle(event: WsUpstreamEvent): Promise<void> {
        await this.orderbookService.whenReady();
        const [marketId, side, price] = (event.payload as MarketOrderAgByPriceReq).params;
        const [,decimalPart = ''] = price.split('.');
        const decimals = decimalPart.length;
        const order = await this.orderbookService.queryOrderAggregateByPrice(marketId, side, price, decimals);
        this.events$.next({
            type: ObEventTypes.DOWNSTREAM_EVENT,
            to: event.from,
            payload: {
                type: WsRequests.MARKET_AG_BY_PRICE,
                payload: Serialize(order, OrderAggregateTpl),
                id: event.payload.id,
            }
        });
    }
}

@Injectable()
export class WsOrderBatchQueryHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderbookService: OrderbookService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.WS_UPSTREAM_EVENT && event.payload.method === WsRequests.MARKET_ORDER_BATCH))
            .subscribe((event: WsUpstreamEvent) => this.handle(event));
    }

    async handle(event: WsUpstreamEvent): Promise<void> {
        await this.orderbookService.whenReady();
        const [marketId, side, orderHashs] = (event.payload as MarketOrderBatchReq).params;
        const orders = await this.orderbookService.buildFillUpToTx(marketId, side, orderHashs);
        this.events$.next({
            type: ObEventTypes.DOWNSTREAM_EVENT,
            to: event.from,
            payload: {
                type: WsRequests.MARKET_ORDER_BATCH,
                payload: orders,
                id: event.payload.id,
            }
        });
    }
}

@Injectable()
export class WsMarketQueryHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderbookService: OrderbookService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.WS_UPSTREAM_EVENT && event.payload.method === WsRequests.MARKET_QUERY))
            .subscribe((event: WsUpstreamEvent) => this.handle(event));
    }

    async handle(event: WsUpstreamEvent): Promise<void> {
        await this.orderbookService.whenReady();
        const markets = await this.orderbookService.getMarkets();
        this.events$.next({
            type: ObEventTypes.DOWNSTREAM_EVENT,
            to: event.from,
            payload: {
                type: WsRequests.MARKET_QUERY,
                payload: markets,
                id: event.payload.id,
            }
        });
    }
}

@Injectable()
export class WsMarketConfigHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private config: ObConfig,
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.WS_UPSTREAM_EVENT && event.payload.method === WsRequests.MARKET_CONFIG))
            .subscribe((event: WsUpstreamEvent) => this.handle(event));
    }

    async handle(event: WsUpstreamEvent): Promise<void> {
        const [marketId] = (event.payload as MarketConfigReq).params;
        this.events$.next({
            type: ObEventTypes.DOWNSTREAM_EVENT,
            to: event.from,
            payload: {
                type: WsRequests.MARKET_ORDER,
                payload: this.config.marketDefault,
                id: event.payload.id,
            }
        });
    }
}

@Injectable()
export class WsOrderPlaceHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderbookService: OrderbookService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.WS_UPSTREAM_EVENT && event.payload.method === WsRequests.ORDER_PLACE))
            .subscribe((event: WsUpstreamEvent) => this.handle(event));
    }

    async handle(event: WsUpstreamEvent): Promise<void> {
        const [order] = (event.payload as OrderPlaceReq).params;
        try {
            const obOrder = await this.orderbookService.validateOrder(order);
            this.events$.next({
                type: ObEventTypes.NEW_ORDER_ONBOARD,
                payload: obOrder,
                source: EventSource.SELF
            });
            this.events$.next({
                type: ObEventTypes.DOWNSTREAM_EVENT,
                to: event.from,
                payload: {
                    type: WsRequests.MARKET_ORDER,
                    payload: {success: true},
                    id: event.payload.id,
                }
            });
        } catch (e) {
            this.events$.next({
                type: ObEventTypes.DOWNSTREAM_EVENT,
                to: event.from,
                payload: {
                    type: WsRequests.MARKET_ORDER,
                    payload: {success: false, error: e.message},
                    id: event.payload.id,
                }
            });
        }
    }
}
