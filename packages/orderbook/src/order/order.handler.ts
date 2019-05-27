import {Inject, Injectable} from '@nestjs/common';
import {Dex} from '@nexex/api';
import {OrderbookOrderTpl} from '@nexex/types/tpl/orderbook';
import {Serialize} from 'cerialize';
import {ObConfig} from '../global/global.model';

import {OrderbookEvent, OrderbookOrder, OrderSide, OrderState, UpdateOrderTask} from '@nexex/types';
import {
    EventSource, MarketOrderReq,
    ObEventTypes,
    OrderDelistEvent,
    OrderUpdateEvent,
    WsRequests,
    WsUpstreamEvent
} from '@nexex/types/orderbook';
import BigNumber from 'bignumber.js';
import {parseEther} from 'ethers/utils';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {EventsModule} from '../events/events.module';
import logger from '../logger';
import {OrderService} from '../order/order.service';
import {bignumberToBignumber} from '../utils/bignumber';

@Injectable()
export class OrderTaskHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderService: OrderService,
        private config: ObConfig,
        private dex: Dex
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.ORDER_UPDATE_TASK))
            .subscribe((event: UpdateOrderTask) => this.handle(event.payload));
    }

    async handle(order: OrderbookOrder): Promise<void> {
        try {
            const availableVolume = bignumberToBignumber(await this.dex.exchange.availableVolume(order.signedOrder));
            const {makerTokenAmount, takerTokenAmount} = order.signedOrder;
            const availableMakerVolume = availableVolume
                .times(makerTokenAmount)
                .div(takerTokenAmount)
                .decimalPlaces(0, BigNumber.ROUND_DOWN);
            let remainingBaseTokenAmount: BigNumber;
            let remainingQuoteTokenAmount: BigNumber;
            if (order.side === OrderSide.ASK) {
                remainingBaseTokenAmount = availableMakerVolume;
                remainingQuoteTokenAmount = availableVolume;
            } else {
                remainingBaseTokenAmount = availableVolume;
                remainingQuoteTokenAmount = availableMakerVolume;
            }
            // remove order if balance is 0 or lower than min amount
            const {minOrderBaseVolume, minOrderQuoteVolume} = this.config.marketDefault;
            if (
                remainingBaseTokenAmount.lte(parseEther(String(minOrderBaseVolume)).toString()) ||
                remainingQuoteTokenAmount.lte(parseEther(String(minOrderQuoteVolume)).toString())
            ) {
                const lastUpdate = new Date();
                await this.orderService.updateVolume({
                    orderHash: order.orderHash,
                    remainingBaseTokenAmount,
                    remainingQuoteTokenAmount,
                    lastUpdate,
                    state: OrderState.UNFUNDED
                });

                const event: OrderDelistEvent = {
                    type: ObEventTypes.ORDER_DELIST,
                    payload: {
                        marketId: `${order.baseTokenAddress}-${order.quoteTokenAddress}`,
                        orderSide: order.side,
                        orderHash: order.orderHash
                    },
                    source: EventSource.SELF
                };
                this.events$.next(event);
                this.events$.next({
                    type: ObEventTypes.PEER_EVENT,
                    payload: event
                });
            } else {
                const lastUpdate = new Date();
                await this.orderService.updateVolume({
                    orderHash: order.orderHash,
                    remainingBaseTokenAmount,
                    remainingQuoteTokenAmount,
                    lastUpdate
                });

                if (!order.remainingBaseTokenAmount.eq(remainingBaseTokenAmount) || !order.remainingQuoteTokenAmount.eq(remainingQuoteTokenAmount)) {
                    const event: OrderUpdateEvent = {
                        type: ObEventTypes.ORDER_BALANCE_UPDATE,
                        payload: {
                            marketId: `${order.baseTokenAddress}-${order.quoteTokenAddress}`,
                            orderSide: order.side,
                            baseAmount: remainingBaseTokenAmount.toString(),
                            quoteAmount: remainingQuoteTokenAmount.toString(),
                            lastUpdate,
                            orderHash: order.orderHash
                        },
                        source: EventSource.SELF
                    };
                    this.events$.next(event);
                    this.events$.next({
                        type: ObEventTypes.PEER_EVENT,
                        payload: event
                    });
                }
            }
        } catch (e) {
            logger.error(`failed to fetch availableVolume for incomming order: ${order.orderHash}`);
            logger.error(e.stack);
        }
    }
}

@Injectable()
export class WsMarketOrderHandler {
    constructor(
        @Inject(EventsModule.EventSubject) private events$: Subject<OrderbookEvent>,
        private orderService: OrderService
    ) {
        events$
            .pipe(filter(event => event.type === ObEventTypes.WS_UPSTREAM_EVENT && event.payload.method === WsRequests.MARKET_ORDER))
            .subscribe((event: WsUpstreamEvent) => this.handle(event));
    }

    async handle(event: WsUpstreamEvent): Promise<void> {
        const [orderHash] = (event.payload as MarketOrderReq).params;
        const order = await this.orderService.findOrder(orderHash);
        this.events$.next({
            type: ObEventTypes.DOWNSTREAM_EVENT,
            to: event.from,
            payload: {
                type: WsRequests.MARKET_ORDER,
                payload: Serialize(order, OrderbookOrderTpl),
                id: event.payload.id,
            }
        });
    }
}
